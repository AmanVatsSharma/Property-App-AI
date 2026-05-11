/**
 * @file area-assessor.service.ts
 * @module area
 * @description Assesses an area (locality/city) via LLM or external provider; updates Area entity.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { withRetry } from '@api/shared/retry';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';
import {
  buildLlmUsageLogFields,
  parseLlmUsageFromLlmMessage,
} from '@api/shared/llm/llm-token-usage';
import { Area } from '../entities/area.entity';
import { AreaRepository, type UpdateAreaData } from '../repository/area.repository';
import { getAreaAssessPrompt } from '../prompts/area-assess.prompt';
import { AGENT_CONFIG_KEYS } from '@api/modules/agent/config/agent-config';

const AREA_ASSESSMENT_TTL_DAYS_KEY = 'AREA_ASSESSMENT_TTL_DAYS';

interface AssessResult {
  livabilityScore: number;
  connectivityScore: number;
  schoolsScore: number;
  safetyScore: number;
  priceTrendPctAnnual: number;
  amenitiesSummary: string;
}

@Injectable()
export class AreaAssessorService {
  constructor(
    private readonly areaRepo: AreaRepository,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Returns true if area has no scores or lastAssessedAt is older than TTL.
   */
  needsAssessment(area: Area): boolean {
    const ttlDays = this.config.get<number>(AREA_ASSESSMENT_TTL_DAYS_KEY) ?? 30;
    if (area.lastAssessedAt) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - ttlDays);
      if (area.lastAssessedAt >= cutoff && area.livabilityScore != null) return false;
    }
    return true;
  }

  /**
   * Assess area via LLM (or external provider when implemented), persist and return updated Area.
   */
  async assess(area: Area): Promise<Area> {
    if (!this.needsAssessment(area)) {
      this.logger.debug('assess skipped: recent assessment', { areaId: area.id });
      return area;
    }

    this.logger.debug('assess start', { areaId: area.id, locality: area.locality, city: area.city });

    const configuredProvider =
      this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'google';
    const prompt = getAreaAssessPrompt(area.locality, area.city);

    let result: AssessResult;
    try {
      const created = tryCreateAgentChatModel(this.config, {
        temperature: 0.2,
        maxOutputTokens: 1024,
      });
      if (!created) {
        this.logger.warn('assess: API key not set for agent provider, using fallback scores', {
          provider: configuredProvider,
        });
        result = this.fallbackAssessResult();
      } else {
        const { llm, provider } = created;
        const response = await withRetry(() => llm.invoke(prompt), { maxRetries: 2, initialMs: 500 });
        const usage = parseLlmUsageFromLlmMessage(response);
        if (usage) {
          this.metrics.recordLlmTokens('area_assess', provider, usage.inputTokens, usage.outputTokens);
          this.logger.info('area assess LLM usage', {
            method: 'assess',
            areaId: area.id,
            ...buildLlmUsageLogFields('area_assess', provider, usage.inputTokens, usage.outputTokens),
          });
        } else {
          this.logger.debug('area assess LLM usage missing', { method: 'assess', areaId: area.id });
        }
        const text = typeof response.content === 'string' ? response.content : String(response.content);
        result = this.parseAssessResult(text);
      }
    } catch (err) {
      this.logger.warn('assess LLM failed, using fallback', {
        areaId: area.id,
        message: err instanceof Error ? err.message : String(err),
      });
      result = this.fallbackAssessResult();
    }

    const update: UpdateAreaData = {
      livabilityScore: this.clamp(result.livabilityScore, 0, 100),
      connectivityScore: this.clamp(result.connectivityScore, 0, 100),
      schoolsScore: this.clamp(result.schoolsScore, 0, 100),
      safetyScore: this.clamp(result.safetyScore, 0, 100),
      priceTrendPctAnnual: result.priceTrendPctAnnual,
      amenitiesSummary: result.amenitiesSummary?.trim() || null,
      dataSource: 'llm',
      lastAssessedAt: new Date(),
    };

    const updated = await this.areaRepo.update(area.id, update);
    this.logger.debug('assess done', { areaId: area.id });
    return updated;
  }

  private parseAssessResult(text: string): AssessResult {
    const fallback = this.fallbackAssessResult();
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return fallback;
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      return {
        livabilityScore: typeof parsed.livabilityScore === 'number' ? parsed.livabilityScore : fallback.livabilityScore,
        connectivityScore: typeof parsed.connectivityScore === 'number' ? parsed.connectivityScore : fallback.connectivityScore,
        schoolsScore: typeof parsed.schoolsScore === 'number' ? parsed.schoolsScore : fallback.schoolsScore,
        safetyScore: typeof parsed.safetyScore === 'number' ? parsed.safetyScore : fallback.safetyScore,
        priceTrendPctAnnual: typeof parsed.priceTrendPctAnnual === 'number' ? parsed.priceTrendPctAnnual : fallback.priceTrendPctAnnual,
        amenitiesSummary: typeof parsed.amenitiesSummary === 'string' ? parsed.amenitiesSummary : fallback.amenitiesSummary,
      };
    } catch {
      return fallback;
    }
  }

  private fallbackAssessResult(): AssessResult {
    return {
      livabilityScore: 75,
      connectivityScore: 70,
      schoolsScore: 70,
      safetyScore: 75,
      priceTrendPctAnnual: 8,
      amenitiesSummary: 'Typical urban locality; connectivity and amenities vary. Verify with local sources.',
    };
  }

  private clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }
}
