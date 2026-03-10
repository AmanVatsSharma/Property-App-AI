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
};
