/**
 * File:        apps/api/src/modules/area/services/negotiation-advisor.service.ts
 * Module:      Area · Negotiation Advisor (AI moat tool)
 * Purpose:     Suggest a buyer offer (₹) and bid strategy for a specific
 *              property, blending: listing data (price, days listed, area,
 *              amenities), locality intelligence (Area liveability + price
 *              trend), and price forecast. LLM-augmented when configured;
 *              deterministic 3–5%-off baseline otherwise. Never throws.
 *
 * Exports:
 *   - NegotiationAdvice               — typed result
 *   - NegotiationAdvisorInput         — caller-supplied listing facts
 *   - NegotiationAdvisorService       — Injectable; `advise(input, ctx?)`
 *
 * Depends on:
 *   - @api/modules/area/services/area  — locality assessment context
 *   - @api/modules/area/services/price-forecast — appreciation outlook
 *   - @api/shared/llm/create-agent-chat-model
 *
 * Architecture note:
 *   Caller passes the loaded Property as `NegotiationAdvisorInput` (not a
 *   propertyId). This avoids a circular dependency — PropertyModule imports
 *   AreaModule, so AreaModule must NOT depend on PropertyService. The agent
 *   tool layer (`AgentToolsService`) has both PropertyService and this
 *   service injected and is the right place to do the load.
 *
 * Side-effects:
 *   - Reads area from DB via AreaService.
 *   - One LLM call when provider configured.
 *   - Prometheus llm_tokens_total + structured log on usage.
 *
 * Key invariants:
 *   - Suggested offer is bounded to [ask × 0.85, ask × 1.00]. Never recommends
 *     offering above ask, never below 15% — defensive against bad LLM output.
 *   - Falls back to a deterministic 3–5% margin (warm market) / 5–7% (cold)
 *     when the LLM is unavailable.
 *   - On a missing property, returns a graceful "not found" advice (never throws).
 *
 * Read order:
 *   1. NegotiationAdvice          — output contract
 *   2. computeBaseline()          — deterministic margin logic
 *   3. NEGOTIATION_PROMPT         — exact JSON contract
 *   4. advise()                   — orchestration + clamping
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';
import {
  buildLlmUsageLogFields,
  parseLlmUsageFromLlmMessage,
} from '@api/shared/llm/llm-token-usage';
import { AreaService } from './area.service';
import { PriceForecastService } from './price-forecast.service';

/**
 * Caller-supplied input. The agent tool layer loads the Property entity and
 * forwards just the fields needed here — keeps the service decoupled from
 * PropertyService (which lives in PropertyModule, downstream of AreaModule).
 */
export interface NegotiationAdvisorInput {
  propertyId: string;
  title: string;
  location: string;
  /** Listing ask price in INR. */
  price: number;
  bedrooms: number | null;
  areaSqft: number | null;
}

export interface NegotiationAdvice {
  propertyId: string;
  found: boolean;
  askPrice: number | null;
  pricePerSqft: number | null;
  /** Recommended *offer* price in INR (already clamped). */
  suggestedOfferInr: number | null;
  /** Margin % below ask the suggested offer represents. */
  marginPctBelowAsk: number | null;
  /** Multi-line strategy text (negotiation script + walk-away). */
  strategy: string;
  /** Comparables / signals the model considered. */
  signals: string[];
  /** Conditions under which buyer should walk away. */
  walkAwayIf: string[];
  confidence: 'low' | 'medium' | 'high';
  source: 'llm' | 'baseline' | 'not_found';
  lastAdvised: string;
}

const NEGOTIATION_PROMPT = (input: {
  title: string;
  location: string;
  ask: number;
  bedrooms: number | null;
  areaSqft: number | null;
  pricePerSqft: number | null;
  livabilityScore: number | null;
  priceTrendPctAnnual: number | null;
  forecast12m: number | null;
  context: string | null;
}) => `
You are a buyer-side property negotiation advisor for the Indian residential
market. Recommend a fair offer for this listing using the inputs below.

Listing:
- Title: ${input.title}
- Location: ${input.location}
- Ask price (INR): ${input.ask}
- BHK: ${input.bedrooms ?? 'unknown'}
- Area (sqft): ${input.areaSqft ?? 'unknown'}
- Price/sqft: ${input.pricePerSqft != null ? `₹${input.pricePerSqft.toFixed(0)}` : 'unknown'}

Locality:
- Liveability score (0-100): ${input.livabilityScore ?? 'unknown'}
- Annual price trend %: ${input.priceTrendPctAnnual ?? 'unknown'}
- 12-month forecast %: ${input.forecast12m ?? 'unknown'}

Buyer context: ${input.context ?? 'none provided'}

Rules:
1. Recommended offer must be between 85% and 100% of the ask price.
2. Be specific. Use comparables, market signal, and trend in your reasoning.
3. Provide a 2-3 sentence negotiation script the buyer can paste in chat.
4. Include 2-4 walk-away conditions.

Return a JSON object ONLY with these exact keys:
- "suggestedOfferInr": number               (whole rupees)
- "marginPctBelowAsk": number               (e.g. 4 means offer is 4% below ask)
- "strategy": string                        (2-3 sentence script + framing)
- "signals": array of strings               (max 5; comparables, days-listed cues, demand)
- "walkAwayIf": array of strings            (2-4 conditions)
- "confidence": string                      ("low" | "medium" | "high")

JSON:`;

const MIN_OFFER_FACTOR = 0.85;
const MAX_OFFER_FACTOR = 1.0;

@Injectable()
export class NegotiationAdvisorService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    private readonly areaService: AreaService,
    private readonly priceForecast: PriceForecastService,
  ) {}

  /**
   * Returns negotiation advice for a property.
   *
   * `input` is the loaded Property data (caller looks it up). When the caller
   * cannot find the property, it should bypass this service and return a
   * "not found" result itself; this method always assumes a valid listing.
   */
  async advise(input: NegotiationAdvisorInput, context?: string): Promise<NegotiationAdvice> {
    const now = new Date().toISOString();
    const ask = Number(input.price);
    const areaSqft = input.areaSqft != null ? Number(input.areaSqft) : null;
    const pricePerSqft = areaSqft && areaSqft > 0 ? ask / areaSqft : null;

    const { locality, city } = this.parseLocationToLocalityCity(input.location);
    const area = await this.areaService.getOrCreate(locality, city, { assessIfMissing: true });
    const forecast = await this.priceForecast.getForecast(locality, city, 12);

    const baseline = this.computeBaseline(ask, area?.priceTrendPctAnnual ?? null, forecast.demandSignal);

    const created = tryCreateAgentChatModel(this.config, {
      temperature: 0.2,
      maxOutputTokens: 768,
    });
    if (!created) {
      return {
        propertyId: input.propertyId,
        found: true,
        askPrice: ask,
        pricePerSqft,
        suggestedOfferInr: baseline.offer,
        marginPctBelowAsk: baseline.marginPct,
        strategy: baseline.strategy + (context ? ` Buyer context: ${context}.` : ''),
        signals: baseline.signals,
        walkAwayIf: baseline.walkAwayIf,
        confidence: 'low',
        source: 'baseline',
        lastAdvised: now,
      };
    }

    try {
      const { llm, provider } = created;
      const res = await llm.invoke(
        NEGOTIATION_PROMPT({
          title: input.title,
          location: input.location,
          ask,
          bedrooms: input.bedrooms ?? null,
          areaSqft,
          pricePerSqft,
          livabilityScore: area?.livabilityScore ?? null,
          priceTrendPctAnnual: area?.priceTrendPctAnnual ?? null,
          forecast12m: forecast.forecast12m ?? null,
          context: context ?? null,
        }),
      );
      const usage = parseLlmUsageFromLlmMessage(res);
      if (usage) {
        this.metrics.recordLlmTokens(
          'negotiation_advice',
          provider,
          usage.inputTokens,
          usage.outputTokens,
        );
        this.logger.info('negotiation advice LLM usage', {
          propertyId: input.propertyId,
          ...buildLlmUsageLogFields(
            'negotiation_advice',
            provider,
            usage.inputTokens,
            usage.outputTokens,
          ),
        });
      }
      const text = typeof res.content === 'string' ? res.content : String(res.content);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return this.fallbackAdvice(input.propertyId, ask, pricePerSqft, baseline, context, now);
      }
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      const rawOffer = Number(parsed.suggestedOfferInr);
      const offer = Number.isFinite(rawOffer)
        ? Math.round(Math.min(Math.max(rawOffer, ask * MIN_OFFER_FACTOR), ask * MAX_OFFER_FACTOR))
        : baseline.offer;

      const marginPct = ask > 0 ? Number((((ask - offer) / ask) * 100).toFixed(1)) : 0;

      const signals = Array.isArray(parsed.signals)
        ? (parsed.signals as unknown[])
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .slice(0, 5)
        : baseline.signals;

      const walkAwayIf = Array.isArray(parsed.walkAwayIf)
        ? (parsed.walkAwayIf as unknown[])
            .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
            .slice(0, 4)
        : baseline.walkAwayIf;

      return {
        propertyId: input.propertyId,
        found: true,
        askPrice: ask,
        pricePerSqft,
        suggestedOfferInr: offer,
        marginPctBelowAsk: marginPct,
        strategy:
          typeof parsed.strategy === 'string' && parsed.strategy.trim()
            ? parsed.strategy.trim()
            : baseline.strategy,
        signals,
        walkAwayIf,
        confidence: (['low', 'medium', 'high'] as const).includes(
          parsed.confidence as 'low' | 'medium' | 'high',
        )
          ? (parsed.confidence as 'low' | 'medium' | 'high')
          : 'medium',
        source: 'llm',
        lastAdvised: now,
      };
    } catch (err) {
      this.logger.warn('NegotiationAdvisorService: LLM call failed', {
        message: err instanceof Error ? err.message : String(err),
      });
      return this.fallbackAdvice(input.propertyId, ask, pricePerSqft, baseline, context, now);
    }
  }

  /** Helper to build the "property not found" result without instantiating the service. */
  notFound(propertyId: string): NegotiationAdvice {
    return {
      propertyId,
      found: false,
      askPrice: null,
      pricePerSqft: null,
      suggestedOfferInr: null,
      marginPctBelowAsk: null,
      strategy: `Property ${propertyId} not found.`,
      signals: [],
      walkAwayIf: [],
      confidence: 'low',
      source: 'not_found',
      lastAdvised: new Date().toISOString(),
    };
  }

  /** Format result as a single string the agent tool can return verbatim. */
  formatForAgent(result: NegotiationAdvice, propertyTitle?: string): string {
    if (!result.found) return result.strategy;
    const inr = (n: number | null) => (n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '—');
    const lines: string[] = [];
    lines.push(
      `Negotiation advice${propertyTitle ? ` for "${propertyTitle}"` : ''}:`,
    );
    lines.push(
      `Ask: ${inr(result.askPrice)} | Suggested offer: ${inr(result.suggestedOfferInr)} (${result.marginPctBelowAsk ?? 0}% below ask).`,
    );
    if (result.pricePerSqft != null) {
      lines.push(`Price/sqft: ₹${result.pricePerSqft.toFixed(0)}.`);
    }
    lines.push(`Strategy: ${result.strategy}`);
    if (result.signals.length) lines.push('Signals: ' + result.signals.map((s) => `• ${s}`).join(' '));
    if (result.walkAwayIf.length)
      lines.push('Walk away if: ' + result.walkAwayIf.map((s) => `• ${s}`).join(' '));
    lines.push(`Confidence: ${result.confidence}.`);
    return lines.join('\n');
  }

  private computeBaseline(
    ask: number,
    priceTrendPctAnnual: number | null,
    demand: 'low' | 'medium' | 'high' | 'surge',
  ): {
    offer: number;
    marginPct: number;
    strategy: string;
    signals: string[];
    walkAwayIf: string[];
  } {
    let marginPct = 5;
    if (demand === 'low') marginPct = 7;
    else if (demand === 'high') marginPct = 3;
    else if (demand === 'surge') marginPct = 1;
    const trend = priceTrendPctAnnual ?? 8;
    if (trend < 4) marginPct += 1;
    if (trend > 12) marginPct = Math.max(1, marginPct - 1);

    const offer = Math.round(ask * (1 - marginPct / 100));
    return {
      offer,
      marginPct,
      strategy: `Open at ${marginPct}% below ask citing comparables and a 12-month demand outlook of "${demand}". Anchor on price/sqft, not the headline figure. Aim to settle ${Math.max(2, marginPct - 2)}–${marginPct}% below ask after one revision.`,
      signals: [
        'Locality price trend',
        'Demand signal: ' + demand,
        'Standard buyer-side margin for similar listings',
      ],
      walkAwayIf: [
        'Seller refuses any movement and inventory has been listed > 90 days.',
        'Title chain or RERA registration cannot be verified.',
        'Maintenance/society dues or encumbrances surface during diligence.',
      ],
    };
  }

  private fallbackAdvice(
    propertyId: string,
    ask: number,
    pricePerSqft: number | null,
    baseline: ReturnType<NegotiationAdvisorService['computeBaseline']>,
    context: string | undefined,
    now: string,
  ): NegotiationAdvice {
    return {
      propertyId,
      found: true,
      askPrice: ask,
      pricePerSqft,
      suggestedOfferInr: baseline.offer,
      marginPctBelowAsk: baseline.marginPct,
      strategy: baseline.strategy + (context ? ` Buyer context: ${context}.` : ''),
      signals: baseline.signals,
      walkAwayIf: baseline.walkAwayIf,
      confidence: 'low',
      source: 'baseline',
      lastAdvised: now,
    };
  }

  private parseLocationToLocalityCity(location: string): { locality: string; city: string } {
    const parts = (location ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return { locality: parts[0], city: parts[parts.length - 1] };
    return { locality: parts[0] ?? location ?? '', city: '' };
  }
}
