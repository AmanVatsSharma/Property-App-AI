/**
 * File:        apps/api/src/modules/admin/dtos/admin-ai-metrics.dto.ts
 * Module:      admin · DTOs
 * Purpose:     REST DTOs for AI usage metrics in admin dashboard.
 *
 * Exports:
 *   - AdminAiMetricsQuery      — query params for GET /admin/ai-metrics
 *   - AiMetricsResponse        — top-level AI metrics payload
 *   - DailyAiMetric            — per-day breakdown of AI usage
 *   - AiToolUsage              — tool usage statistics
 *   - AiProviderCost           — cost breakdown by provider
 *
 * Depends on:
 *   - @api/shared/llm/llm-token-usage — token cost estimation utilities
 *   - @api/modules/metrics/services/metrics.service — MetricsService (Prometheus)
 *
 * Side-effects:  none (read-only metrics)
 *
 * Key invariants:
 *   - Dates are stored/returned as ISO 8601 strings
 *   - Cost estimates are denominated in USD
 *   - Google provider uses a fixed $0.001/1K-token rate for estimation
 *
 * Read order:
 *   1. AiMetricsResponse    — primary payload
 *   2. DailyAiMetric         — daily breakdown entries
 *   3. AiProviderCost        — provider cost breakdown
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class AdminAiMetricsQuery {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Filter by LLM provider: 'google' | 'openai' | 'anthropic' */
  @IsOptional()
  @IsString()
  provider?: string;
}

/**
 * Top-level AI metrics response — aggregate stats + breakdowns.
 * Queried from Prometheus counter `llm_tokens_total` and histogram `agent_duration_seconds`.
 */
@ObjectType()
export class AiMetricsResponse {
  @Field(() => Int, { description: 'Total AI queries in the requested period' })
  totalQueries!: number;

  @Field(() => Int, { description: 'Total LLM tokens consumed (input + output combined)' })
  totalTokens!: number;

  @Field(() => Int, { description: 'Total input tokens consumed' })
  totalInputTokens!: number;

  @Field(() => Int, { description: 'Total output tokens consumed' })
  totalOutputTokens!: number;

  @Field(() => Float, { description: 'Average AI agent response time in milliseconds' })
  avgResponseTimeMs!: number;

  @Field(() => Float, { description: 'Estimated USD spent on LLM calls (Sonnet 4 base rate)' })
  estimatedCostUsd!: number;

  @Field(() => Float, { description: 'Fraction of AI queries that failed (0-1)' })
  errorRate!: number;

  @Field(() => [DailyAiMetric], { description: 'Per-day token and query counts for the period' })
  queriesByDay!: DailyAiMetric[];

  @Field(() => [AiToolUsage], { description: 'Most-used agent tools by query count' })
  topTools!: AiToolUsage[];

  @Field(() => [AiProviderCost], { description: 'Token and cost breakdown by LLM provider' })
  costByProvider!: AiProviderCost[];
}

@ObjectType()
export class DailyAiMetric {
  @Field(() => String, { description: 'Date in YYYY-MM-DD format' })
  date!: string;

  @Field(() => Int, { description: 'Number of AI queries on this day' })
  queryCount!: number;

  @Field(() => Int, { description: 'Total tokens consumed on this day' })
  tokenCount!: number;

  @Field(() => Float, { description: 'Estimated USD cost for this day' })
  costUsd!: number;
}

@ObjectType()
export class AiToolUsage {
  @Field(() => String, { description: 'Tool name as registered in the agent' })
  tool!: string;

  @Field(() => Int, { description: 'Number of times this tool was called' })
  callCount!: number;

  @Field(() => Float, { description: 'Fraction of all AI queries that used this tool (0-1)' })
  fraction!: number;
}

@ObjectType()
export class AiProviderCost {
  @Field(() => String, { description: 'LLM provider name: google | openai | anthropic' })
  provider!: string;

  @Field(() => Int, { description: 'Total tokens consumed with this provider' })
  tokens!: number;

  @Field(() => Float, { description: 'Estimated cost in USD' })
  costUsd!: number;

  @Field(() => Float, { description: 'Fraction of total AI queries routed to this provider (0-1)' })
  fraction!: number;
}