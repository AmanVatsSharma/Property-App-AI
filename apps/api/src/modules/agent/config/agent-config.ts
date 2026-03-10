/**
 * @file agent-config.ts
 * @module agent
 * @description Typed agent configuration from env; model, limits, queue.
 * @author BharatERP
 * @created 2025-03-11
 */

export interface AgentConfig {
  openaiApiKey: string;
  model: string;
  maxSteps: number;
  queueEnabled: boolean;
  redisUrl?: string;
}

export const AGENT_CONFIG_KEYS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  AGENT_MODEL: 'AGENT_MODEL',
  AGENT_MAX_STEPS: 'AGENT_MAX_STEPS',
  AGENT_QUEUE_ENABLED: 'AGENT_QUEUE_ENABLED',
  REDIS_URL: 'REDIS_URL',
} as const;
