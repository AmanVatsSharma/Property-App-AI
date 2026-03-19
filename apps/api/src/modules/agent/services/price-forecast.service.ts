/**
 * @file price-forecast.service.ts
 * @module agent
 * @description Price forecast service; uses LLM to generate structured forecast when API key present.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { AGENT_CONFIG_KEYS } from '../config/agent-config';

export interface PriceForecastResult {
  locality: string;
  city: string;
  currentPricePerSqft: number | null;
  forecast12m: number;
  forecast24m: number;
  forecast36m: number;
  demandSignal: 'low' | 'medium' | 'high' | 'surge';
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

const FORECAST_PROMPT = (locality: string, city: string) => `
You are a real estate market analyst for Indian residential property markets.

Locality: ${locality}${city ? `, ${city}` : ''}

Return a JSON object ONLY with these exact keys:
- "forecast12m": number (estimated % price appreciation in 12 months, e.g. 8.5)
- "forecast24m": number (24 months, cumulative %)
- "forecast36m": number (36 months, cumulative %)
- "demandSignal": string ("low" | "medium" | "high" | "surge")
- "rationale": string (2-3 sentences on key drivers: infra, employment, demand)
- "confidence": string ("low" | "medium" | "high")

Base your analysis on known patterns for this locality. Be realistic, not optimistic.

JSON:`;

@Injectable()
export class PriceForecastService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async getForecast(
    locality: string,
    city = '',
    _horizonMonths = 24,
  ): Promise<PriceForecastResult> {
    const base: PriceForecastResult = {
      locality,
      city,
      currentPricePerSqft: null,
      forecast12m: 8,
      forecast24m: 17,
      forecast36m: 28,
      demandSignal: 'medium',
      rationale:
        'Forecast based on historical Indian residential market trends. Connect AI provider for locality-specific analysis.',
      confidence: 'low',
      lastUpdated: new Date().toISOString(),
    };

    try {
      const provider =
        this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'openai';
      let text: string;

      if (provider === 'anthropic') {
        const apiKey = this.config.get<string>(AGENT_CONFIG_KEYS.ANTHROPIC_API_KEY);
        if (!apiKey?.trim()) return base;
        const { ChatAnthropic } = await import('@langchain/anthropic');
        const model =
          this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_ANTHROPIC_MODEL) ??
          'claude-sonnet-4-20250514';
        const llm = new ChatAnthropic({
          anthropicApiKey: apiKey,
          model,
          temperature: 0.1,
          maxTokens: 512,
        });
        const res = await llm.invoke(FORECAST_PROMPT(locality, city));
        text = typeof res.content === 'string' ? res.content : String(res.content);
      } else {
        const apiKey = this.config.get<string>(AGENT_CONFIG_KEYS.OPENAI_API_KEY);
        if (!apiKey?.trim()) return base;
        const { ChatOpenAI } = await import('@langchain/openai');
        const modelName =
          this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_MODEL) ?? 'gpt-4o';
        const llm = new ChatOpenAI({
          modelName,
          temperature: 0.1,
          openAIApiKey: apiKey,
        });
        const res = await llm.invoke(FORECAST_PROMPT(locality, city));
        text = typeof res.content === 'string' ? res.content : String(res.content);
      }

      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return base;
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      return {
        ...base,
        forecast12m:
          typeof parsed.forecast12m === 'number' ? parsed.forecast12m : base.forecast12m,
        forecast24m:
          typeof parsed.forecast24m === 'number' ? parsed.forecast24m : base.forecast24m,
        forecast36m:
          typeof parsed.forecast36m === 'number' ? parsed.forecast36m : base.forecast36m,
        demandSignal: [
          'low',
          'medium',
          'high',
          'surge',
        ].includes(parsed.demandSignal as string)
          ? (parsed.demandSignal as PriceForecastResult['demandSignal'])
          : base.demandSignal,
        rationale:
          typeof parsed.rationale === 'string' ? parsed.rationale : base.rationale,
        confidence: ['low', 'medium', 'high'].includes(parsed.confidence as string)
          ? (parsed.confidence as PriceForecastResult['confidence'])
          : base.confidence,
      };
    } catch (err) {
      this.logger.warn('PriceForecastService: LLM call failed', {
        message: err instanceof Error ? err.message : String(err),
      });
      return base;
    }
  }
}
