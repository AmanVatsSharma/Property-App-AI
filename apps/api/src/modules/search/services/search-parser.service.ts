/**
 * @file search-parser.service.ts
 * @module search
 * @description Parses natural-language property search query to structured filters using LLM.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { LoggerService } from '@api/shared/logger';
import { AGENT_CONFIG_KEYS } from '@api/modules/agent/config/agent-config';
import { getSearchParsePrompt } from '../prompts/search-parse.prompt';

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
    const provider = this.config.get<'openai' | 'anthropic'>(AGENT_CONFIG_KEYS.AGENT_PROVIDER) ?? 'openai';
    const prompt = getSearchParsePrompt(trimmed);
    try {
      if (provider === 'anthropic') {
        const apiKey = this.config.get<string>(AGENT_CONFIG_KEYS.ANTHROPIC_API_KEY);
        if (!apiKey?.trim()) {
          this.logger.debug('search parse: ANTHROPIC_API_KEY not set', { method: 'parse' });
          return this.fallbackFromQuery(trimmed);
        }
        const model = this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_ANTHROPIC_MODEL) ?? 'claude-sonnet-4-20250514';
        const llm = new ChatAnthropic({ anthropicApiKey: apiKey, model, temperature: 0.2, maxTokens: 512 });
        const response = await llm.invoke(prompt);
        const text = typeof response.content === 'string' ? response.content : String(response.content);
        return this.parseJsonToParams(text);
      }
      const apiKey = this.config.get<string>(AGENT_CONFIG_KEYS.OPENAI_API_KEY);
      if (!apiKey?.trim()) {
        this.logger.debug('search parse: OPENAI_API_KEY not set', { method: 'parse' });
        return this.fallbackFromQuery(trimmed);
      }
      const model = this.config.get<string>(AGENT_CONFIG_KEYS.AGENT_MODEL) ?? 'gpt-4o';
      const llm = new ChatOpenAI({ modelName: model, temperature: 0.2, openAIApiKey: apiKey });
      const response = await llm.invoke(prompt);
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
