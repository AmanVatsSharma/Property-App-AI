/**
 * @file agent-config.ts
 * @module agent
 * @description Typed agent configuration from env; provider, model, limits, queue, thinking.
 * @author BharatERP
 * @created 2025-03-11
 */

export type AgentProvider = 'openai' | 'anthropic';

export interface AgentConfig {
  openaiApiKey: string;
  model: string;
  maxSteps: number;
  queueEnabled: boolean;
  redisUrl?: string;
  provider: AgentProvider;
  anthropicApiKey?: string;
  anthropicModel: string;
  thinkingBudgetTokens?: number;
  planFirst: boolean;
}

export const AGENT_CONFIG_KEYS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  AGENT_MODEL: 'AGENT_MODEL',
  AGENT_MAX_STEPS: 'AGENT_MAX_STEPS',
  AGENT_QUEUE_ENABLED: 'AGENT_QUEUE_ENABLED',
  REDIS_URL: 'REDIS_URL',
  AGENT_PROVIDER: 'AGENT_PROVIDER',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  AGENT_ANTHROPIC_MODEL: 'AGENT_ANTHROPIC_MODEL',
  AGENT_THINKING_BUDGET_TOKENS: 'AGENT_THINKING_BUDGET_TOKENS',
  AGENT_PLAN_FIRST: 'AGENT_PLAN_FIRST',
} as const;
