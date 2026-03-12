/**
 * @file env.schema.ts
 * @module shared/config
 * @description Joi schema for environment validation at bootstrap.
 * @author BharatERP
 * @created 2025-03-10
 */

import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3333),
  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('property_app'),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('debug'),
  THROTTLE_TTL: Joi.number().min(1).default(60),
  THROTTLE_LIMIT: Joi.number().min(1).default(100),
  CORS_ORIGIN: Joi.string().default('*'),
  JWT_SECRET: Joi.string().min(16).optional().allow(''),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  AGENT_MODEL: Joi.string().default('gpt-4o'),
  AGENT_MAX_STEPS: Joi.number().min(1).max(20).default(10),
  AGENT_QUEUE_ENABLED: Joi.boolean().default(false),
  REDIS_URL: Joi.string().uri().optional().allow(''),
  AGENT_RATE_LIMIT_PER_MIN: Joi.number().min(1).max(120).default(10),
  AGENT_PROVIDER: Joi.string().valid('openai', 'anthropic').default('openai'),
  ANTHROPIC_API_KEY: Joi.string().optional().allow(''),
  AGENT_ANTHROPIC_MODEL: Joi.string().default('claude-sonnet-4-20250514'),
  AGENT_THINKING_BUDGET_TOKENS: Joi.number().min(0).max(32000).optional(),
  AGENT_PLAN_FIRST: Joi.boolean().default(false),
  AWS_REGION: Joi.string().optional().allow(''),
  S3_BUCKET: Joi.string().optional().allow(''),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  S3_PUBLIC_BASE_URL: Joi.string().uri().optional().allow(''),
  MAPBOX_ACCESS_TOKEN: Joi.string().optional().allow(''),
  ADMIN_PHONES: Joi.string().optional().allow(''),
  BROKER_PHONES: Joi.string().optional().allow(''),
  AREA_ASSESSMENT_TTL_DAYS: Joi.number().min(0).max(365).default(30),
  AREA_PROVIDER: Joi.string().valid('none', 'mapbox').default('none'),
}).unknown(true);

export type EnvSchema = {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  LOG_LEVEL: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  CORS_ORIGIN: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  OPENAI_API_KEY?: string;
  AGENT_MODEL: string;
  AGENT_MAX_STEPS: number;
  AGENT_QUEUE_ENABLED: boolean;
  REDIS_URL?: string;
  AGENT_RATE_LIMIT_PER_MIN?: number;
  AGENT_PROVIDER: 'openai' | 'anthropic';
  ANTHROPIC_API_KEY?: string;
  AGENT_ANTHROPIC_MODEL: string;
  AGENT_THINKING_BUDGET_TOKENS?: number;
  AGENT_PLAN_FIRST: boolean;
  AWS_REGION?: string;
  S3_BUCKET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  S3_PUBLIC_BASE_URL?: string;
  MAPBOX_ACCESS_TOKEN?: string;
  ADMIN_PHONES?: string;
  BROKER_PHONES?: string;
  AREA_ASSESSMENT_TTL_DAYS?: number;
  AREA_PROVIDER?: string;
};
