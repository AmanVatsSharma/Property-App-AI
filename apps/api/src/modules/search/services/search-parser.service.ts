/**
 * @file search-parser.service.ts
 * @module search
 * @description Parses natural-language property search query to structured filters using LLM.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { AGENT_CONFIG_KEYS } from '@api/modules/agent/config/agent-config';
import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';
import { getSearchParsePrompt } from '../prompts/search-parse.prompt';
import {
  buildLlmUsageLogFields,
  parseLlmUsageFromLlmMessage,
} from '@api/shared/llm/llm-token-usage';

export interface ParsedSearchParams {
  location?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  schoolsScoreMin?: number;
  connectivityScoreMin?: number;
}

@Injectable()
export class SearchParserService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Parse natural language search query to structured filter params using LLM.
   * Returns empty object when LLM not configured or parse fails.
   */
  async parse(query: string): Promise<ParsedSearchParams> {
    const trimmed = query?.trim();
    if (!trimmed) {
      this.logger.debug('search parse: empty query', { method: 'parse' });
      return {};
    }
    const configuredProvider =
      this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'google';
    const prompt = getSearchParsePrompt(trimmed);
    try {
      const created = tryCreateAgentChatModel(this.config, {
        temperature: 0.2,
        maxOutputTokens: 512,
      });
      if (!created) {
        this.logger.debug('search parse: API key not set for agent provider', {
          method: 'parse',
          provider: configuredProvider,
        });
        return this.fallbackFromQuery(trimmed);
      }
      const { llm, provider } = created;
      const response = await llm.invoke(prompt);
      const usage = parseLlmUsageFromLlmMessage(response);
      if (usage) {
        this.metrics.recordLlmTokens('search_parse', provider, usage.inputTokens, usage.outputTokens);
        this.logger.info('search parse LLM usage', {
          method: 'parse',
          queryPrefix: trimmed.substring(0, 80),
          ...buildLlmUsageLogFields('search_parse', provider, usage.inputTokens, usage.outputTokens),
        });
      } else {
        this.logger.debug('search parse LLM usage missing', { method: 'parse' });
      }
      const text = typeof response.content === 'string' ? response.content : String(response.content);
      return this.parseJsonToParams(text);
    } catch (err) {
      this.logger.warn('search parse LLM failed', {
        method: 'parse',
        query: trimmed.substring(0, 80),
        message: err instanceof Error ? err.message : String(err),
      });
      return this.fallbackFromQuery(trimmed);
    }
  }

  private parseJsonToParams(text: string): ParsedSearchParams {
    const result: ParsedSearchParams = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return result;
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      if (typeof parsed.location === 'string' && parsed.location.trim()) result.location = parsed.location.trim();
      if (typeof parsed.bedrooms === 'number' && Number.isInteger(parsed.bedrooms)) result.bedrooms = parsed.bedrooms;
      if (typeof parsed.minPrice === 'number' && parsed.minPrice >= 0) result.minPrice = parsed.minPrice;
      if (typeof parsed.maxPrice === 'number' && parsed.maxPrice >= 0) result.maxPrice = parsed.maxPrice;
      if (typeof parsed.type === 'string' && parsed.type.trim()) result.type = parsed.type.trim();
      if (typeof parsed.schoolsScoreMin === 'number') result.schoolsScoreMin = Math.min(100, Math.max(0, parsed.schoolsScoreMin));
      if (typeof parsed.connectivityScoreMin === 'number') result.connectivityScoreMin = Math.min(100, Math.max(0, parsed.connectivityScoreMin));
    } catch {
      // ignore
    }
    return result;
  }

  private fallbackFromQuery(query: string): ParsedSearchParams {
    const result: ParsedSearchParams = {};
    const lower = query.toLowerCase();
    const bhkMatch = query.match(/(\d)\s*bhk|(\d)\s*bed/);
    if (bhkMatch) {
      const n = parseInt(bhkMatch[1] ?? bhkMatch[2] ?? '0', 10);
      if (Number.isInteger(n)) result.bedrooms = n;
    }
    if (lower.includes('near school') || lower.includes('schools')) result.schoolsScoreMin = 60;
    if (lower.includes('near metro') || lower.includes('metro') || lower.includes('connectivity')) result.connectivityScoreMin = 70;
    return result;
  }
}
