/**
 * @file price-forecast.service.ts
 * @module area
 * @description Price forecast service; uses real property data from DB when
 *              available, LLM for narrative generation. Falls back to market
 *              averages when insufficient data.
 * @author BharatERP
 * @created 2026-03-19
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '@api/modules/property/entities/property.entity';

export interface PriceForecastResult {
  locality: string;
  city: string;
  currentPricePerSqft: number | null;
  /** Number of properties used to calculate price/sqft */
  comparableCount: number;
  forecast12m: number;
  forecast24m: number;
  forecast36m: number;
  demandSignal: 'low' | 'medium' | 'high' | 'surge';
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

interface PropertyData {
  price: number;
  areaSqft: number;
  createdAt: Date;
}

interface PriceTrendResult {
  avgPricePerSqft: number | null;
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  trendPct: number | null;
}

const FORECAST_PROMPT = (
  locality: string,
  city: string,
  trendResult: PriceTrendResult,
) => `
You are a real estate market analyst for Indian residential property markets.

Locality: ${locality}${city ? `, ${city}` : ''}

Actual market data available for this locality:
- Comparable properties: ${trendResult.count}
- Average price/sqft: ${trendResult.avgPricePerSqft != null ? `₹${Math.round(trendResult.avgPricePerSqft)}` : 'insufficient data'}
- Price range: ${trendResult.minPrice != null ? `₹${(trendResult.minPrice / 100000).toFixed(1)}L - ₹${(trendResult.maxPrice! / 100000).toFixed(1)}L` : 'unknown'}
${trendResult.trendPct != null ? `- 6-month price trend: ${trendResult.trendPct > 0 ? '+' : ''}${trendResult.trendPct.toFixed(1)}%` : ''}

Return a JSON object ONLY with these exact keys:
- "forecast12m": number (estimated % price appreciation in 12 months, e.g. 8.5)
- "forecast24m": number (24 months, cumulative %)
- "forecast36m": number (36 months, cumulative %)
- "demandSignal": string ("low" | "medium" | "high" | "surge")
- "rationale": string (2-3 sentences on key drivers: infra, employment, demand)
- "confidence": string ("low" | "medium" | "high")
- "currentPricePerSqft": number (use the actual market data if available)

Be realistic, not optimistic. Ground your analysis in actual market data when available.

JSON:`;

@Injectable()
export class PriceForecastService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  /**
   * Calculate price per sqft trend from comparable properties in the locality.
   * Returns null for avgPricePerSqft when insufficient data (< 3 properties).
   */
  private async calculatePriceTrend(
    locality: string,
  ): Promise<PriceTrendResult> {
    const qb = this.propertyRepo.createQueryBuilder('p');
    qb.andWhere('p.status = :status', { status: 'active' });
    qb.andWhere('p.location ILIKE :locality', { locality: `%${locality}%` });
    qb.andWhere('p.price IS NOT NULL');
    qb.andWhere('p.areaSqft IS NOT NULL AND p.areaSqft > 0');
    qb.orderBy('p.createdAt', 'DESC');
    qb.take(50);
    const properties = await qb.getMany();
    if (properties.length < 3) {
      return { avgPricePerSqft: null, count: 0, minPrice: null, maxPrice: null, trendPct: null };
    }

    const data: PropertyData[] = properties.map((p) => ({
      price: Number(p.price),
      areaSqft: Number(p.areaSqft),
      createdAt: p.createdAt,
    }));

    const pricesPerSqft = data.map((d) => d.price / d.areaSqft);
    const avgPricePerSqft = pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length;
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate 6-month trend by comparing older vs newer listings
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const older = data.filter((d) => d.createdAt < sixMonthsAgo);
    const newer = data.filter((d) => d.createdAt >= sixMonthsAgo);

    let trendPct: number | null = null;
    if (older.length >= 2 && newer.length >= 2) {
      const olderAvg = older.reduce((a, d) => a + d.price / d.areaSqft, 0) / older.length;
      const newerAvg = newer.reduce((a, d) => a + d.price / d.areaSqft, 0) / newer.length;
      trendPct = ((newerAvg - olderAvg) / olderAvg) * 100;
    }

    return {
      avgPricePerSqft: Math.round(avgPricePerSqft),
      count: properties.length,
      minPrice,
      maxPrice,
      trendPct,
    };
  }

  /**
   * Calculate confidence based on data volume.
   * - High: 10+ properties with trend data
   * - Medium: 5+ comparables
   * - Low: otherwise
   */
  private calculateConfidence(
    count: number,
    hasTrend: boolean,
  ): 'low' | 'medium' | 'high' {
    if (count >= 10 && hasTrend) return 'high';
    if (count >= 5) return 'medium';
    return 'low';
  }

  async getForecast(
    locality: string,
    city = '',
    _horizonMonths = 24,
  ): Promise<PriceForecastResult> {
    const trendResult = await this.calculatePriceTrend(locality);
    const base: PriceForecastResult = {
      locality,
      city,
      currentPricePerSqft: trendResult.avgPricePerSqft,
      comparableCount: trendResult.count,
      forecast12m: 8,
      forecast24m: 17,
      forecast36m: 28,
      demandSignal: 'medium',
      rationale:
        'Forecast based on historical Indian residential market trends. Connect AI provider for locality-specific analysis.',
      confidence: this.calculateConfidence(trendResult.count, trendResult.trendPct !== null),
      lastUpdated: new Date().toISOString(),
    };

    try {
      const created = tryCreateAgentChatModel(this.config, {
        temperature: 0.1,
        maxOutputTokens: 512,
      });
      if (!created) {
        // No LLM: use data-driven fallback with market-based forecasts
        return this.generateDataDrivenForecast(locality, base, trendResult);
      }
      const { llm, provider } = created;
      const res = await llm.invoke(FORECAST_PROMPT(locality, city, trendResult));
      const usage = parseLlmUsageFromLlmMessage(res);
      if (usage) {
        this.metrics.recordLlmTokens('price_forecast', provider, usage.inputTokens, usage.outputTokens);
        this.logger.info('price forecast LLM usage', {
          locality,
          city,
          comparableCount: trendResult.count,
          ...buildLlmUsageLogFields('price_forecast', provider, usage.inputTokens, usage.outputTokens),
        });
      }
      const text = typeof res.content === 'string' ? res.content : String(res.content);

      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return this.generateDataDrivenForecast(locality, base, trendResult);
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      // Prefer actual data over LLM output for price/sqft
      const parsedPricePerSqft =
        typeof parsed.currentPricePerSqft === 'number' ? parsed.currentPricePerSqft : null;
      const finalPricePerSqft =
        trendResult.avgPricePerSqft ?? parsedPricePerSqft;

      return {
        ...base,
        currentPricePerSqft: finalPricePerSqft,
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
      return this.generateDataDrivenForecast(locality, base, trendResult);
    }
  }

  /**
   * Generate forecast using actual market data when LLM is unavailable.
   * Applies market context based on data volume and trends.
   */
  private generateDataDrivenForecast(
    locality: string,
    base: PriceForecastResult,
    trend: PriceTrendResult,
  ): PriceForecastResult {
    if (trend.count < 3) {
      return base;
    }

    // Use actual price/sqft from data
    let forecast12m = 8;
    let forecast24m = 17;
    let forecast36m = 28;
    let demandSignal: PriceForecastResult['demandSignal'] = 'medium';
    let rationale = `Based on ${trend.count} comparable properties in ${locality}.`;

    if (trend.trendPct !== null) {
      // Annualize the 6-month trend for 12m forecast
      const annualTrend = trend.trendPct * 2;
      forecast12m = Math.round(annualTrend * 10) / 10;
      forecast24m = Math.round((annualTrend + (annualTrend * (1 + annualTrend / 100))) * 10) / 10;
      forecast36m = Math.round((annualTrend * 1.5 + (annualTrend * 1.5 * (1 + annualTrend / 100))) * 10) / 10;

      // Clamp to reasonable bounds
      forecast12m = Math.max(-5, Math.min(15, forecast12m));
      forecast24m = Math.max(-10, Math.min(30, forecast24m));
      forecast36m = Math.max(-15, Math.min(45, forecast36m));

      rationale += ` ${trend.trendPct > 0 ? 'Prices show an upward trend' : 'Prices show a downward trend'} in recent listings.`;
    }

    if (trend.avgPricePerSqft !== null) {
      if (trend.avgPricePerSqft > 15000) {
        demandSignal = 'high';
        rationale += ' Premium area with high demand.';
      } else if (trend.avgPricePerSqft < 5000) {
        demandSignal = 'low';
        rationale += ' Value segment with moderate demand.';
      }
    }

    return {
      ...base,
      forecast12m,
      forecast24m,
      forecast36m,
      demandSignal,
      rationale,
      confidence: this.calculateConfidence(trend.count, trend.trendPct !== null),
    };
  }
}
