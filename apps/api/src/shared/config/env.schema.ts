/**
 * File:        apps/api/src/shared/config/env.schema.ts
 * Module:      shared/config
 * Purpose:     Joi schema for validating all environment variables at bootstrap. Fails fast
 *              on missing/invalid values so misconfigured deploys never silently degrade.
 *
 * Exports:
 *   - envSchema     — Joi ObjectSchema used by AppConfigModule
 *   - EnvSchema     — TypeScript type derived from the schema shape
 *
 * Side-effects:   none (pure schema definition)
 *
 * Key invariants:
 *   - DB_TYPE=sqlite   → DB_PATH used (file path); DB_HOST/PORT/USER/PASS ignored
 *   - DB_TYPE=postgres → DB_HOST/PORT/USER/PASS/NAME required (have safe defaults for dev)
 *   - In production:   JWT_SECRET must be ≥16 chars; CORS_ORIGIN must be explicit
 *   - All optional keys that are genuinely unused must be .allow('') to survive CI env injection
 *
 * Read order:
 *   1. envSchema — Joi object; every field is documented inline
 *   2. EnvSchema — companion TypeScript type for ConfigService.get<>() type safety
 *
 * Author:       BharatERP
 * Last-updated: 2026-05-07
 */

import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3333),
  /** sqlite → better-sqlite3 file DB (dev only); postgres → standard PG connection (default) */
  DB_TYPE: Joi.string().valid('sqlite', 'postgres').default('postgres'),
  /** Path to SQLite file when DB_TYPE=sqlite. Relative to CWD (repo root when run via Nx). */
  DB_PATH: Joi.string().optional().allow('').default('./dev.sqlite'),
  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('property_app'),
  DB_POOL_MAX: Joi.number().min(1).max(100).default(20),
  DB_POOL_IDLE_TIMEOUT_MS: Joi.number().min(1000).max(120000).default(30000),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('debug'),
  THROTTLE_TTL: Joi.number().min(1).default(60),
  THROTTLE_LIMIT: Joi.number().min(1).default(100),
  REQUEST_TIMEOUT_MS: Joi.number().min(1000).max(120000).default(30000),
  CORS_ORIGIN: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().invalid('*').messages({ 'any.invalid': 'CORS_ORIGIN must be explicit in production' }),
    otherwise: Joi.string().default('*'),
  }),
  JWT_SECRET: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(16).required().messages({ 'string.min': 'JWT_SECRET must be at least 16 characters in production' }),
    otherwise: Joi.string().min(16).optional().allow(''),
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  AGENT_MODEL: Joi.string().default('gpt-4o'),
  AGENT_MAX_STEPS: Joi.number().min(1).max(20).default(10),
  AGENT_QUEUE_ENABLED: Joi.boolean().default(false),
  REDIS_URL: Joi.string().uri().optional().allow(''),
  AGENT_RATE_LIMIT_PER_MIN: Joi.number().min(1).max(120).default(10),
  AGENT_PROVIDER: Joi.string().valid('openai', 'anthropic', 'google').default('google'),
  ANTHROPIC_API_KEY: Joi.string().optional().allow(''),
  AGENT_ANTHROPIC_MODEL: Joi.string().default('claude-sonnet-4-20250514'),
  GOOGLE_API_KEY: Joi.string().optional().allow(''),
  AGENT_GOOGLE_MODEL: Joi.string().default('gemini-2.0-flash'),
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
  /** OTP: stub (default, log only) | twilio | msg91 | zavu. Production requires twilio, msg91, or zavu (main.ts enforces). */
  SMS_PROVIDER: Joi.string().valid('stub', 'twilio', 'msg91', 'zavu').optional().allow(''),
  TWILIO_ACCOUNT_SID: Joi.string().optional().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().optional().allow(''),
  TWILIO_FROM: Joi.string().optional().allow(''),
  MSG91_AUTH_KEY: Joi.string().optional().allow(''),
  MSG91_SENDER: Joi.string().optional().allow(''),
  /** Control API v5 template id (##OTP##). Required for POST /auth/otp/send REST flow. */
  MSG91_TEMPLATE_ID: Joi.string().optional().allow(''),
  /** Base URL without trailing slash (default https://control.msg91.com/api/v5). */
  MSG91_OTP_BASE_URL: Joi.string().uri().optional().allow(''),
  MSG91_OTP_HTTP_TIMEOUT_MS: Joi.number().min(3000).max(120000).optional(),
  MSG91_OTP_HTTP_RETRIES: Joi.number().min(0).max(5).optional(),
  /** When false, REST /auth/otp/* returns 503 for send/verify. GraphQL OTP unchanged. */
  REST_OTP_MSG91_ENABLED: Joi.boolean().default(true),
  OTP_BCRYPT_ROUNDS: Joi.number().min(8).max(14).default(10),
  OTP_REST_TTL_SEC: Joi.number().min(60).max(900).default(300),
  OTP_REST_SEND_RATE_LIMIT: Joi.number().min(1).max(50).default(5),
  OTP_REST_SEND_RATE_WINDOW_SEC: Joi.number().min(60).max(3600).default(600),
  OTP_REST_MAX_VERIFY_ATTEMPTS: Joi.number().min(1).max(10).default(3),
  OTP_REST_RESEND_COOLDOWN_SEC: Joi.number().min(0).max(600).default(60),
  /** Zavu unified messaging (SMS OTP when SMS_PROVIDER=zavu). */
  ZAVUDEV_API_KEY: Joi.string().optional().allow(''),
  /** Optional sender profile ID (Zavu-Sender header). */
  ZAVUDEV_SENDER: Joi.string().optional().allow(''),
  NEXT_PUBLIC_SITE_URL: Joi.string().uri().optional().allow(''),
  COMPRESSION_ENABLED: Joi.boolean().default(true),
  WS_CORS_ORIGIN: Joi.string().optional().allow(''),
  GOOGLE_SITE_VERIFICATION: Joi.string().optional().allow(''),
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  SMTP_FROM: Joi.string().optional().allow(''),
  /** Enable WhatsApp QR OTP flow (WhatsApp Web scan, no Meta Business API). Defaults false. */
  WHATSAPP_QR_ENABLED: Joi.boolean().default(false),
  /** Own WhatsApp number with country code, no + prefix (e.g. 919876543210). Used as device identity. */
  WHATSAPP_QR_OWN_NUMBER: Joi.string().pattern(/^\d{10,15}$/).optional(),
}).unknown(true);

export type EnvSchema = {
  NODE_ENV: string;
  PORT: number;
  DB_TYPE: 'sqlite' | 'postgres';
  DB_PATH?: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_POOL_MAX?: number;
  DB_POOL_IDLE_TIMEOUT_MS?: number;
  LOG_LEVEL: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  REQUEST_TIMEOUT_MS?: number;
  CORS_ORIGIN: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  OPENAI_API_KEY?: string;
  AGENT_MODEL: string;
  AGENT_MAX_STEPS: number;
  AGENT_QUEUE_ENABLED: boolean;
  REDIS_URL?: string;
  AGENT_RATE_LIMIT_PER_MIN?: number;
  AGENT_PROVIDER: 'openai' | 'anthropic' | 'google';
  ANTHROPIC_API_KEY?: string;
  AGENT_ANTHROPIC_MODEL: string;
  GOOGLE_API_KEY?: string;
  AGENT_GOOGLE_MODEL: string;
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
  SMS_PROVIDER?: 'stub' | 'twilio' | 'msg91' | 'zavu';
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM?: string;
  MSG91_AUTH_KEY?: string;
  MSG91_SENDER?: string;
  MSG91_TEMPLATE_ID?: string;
  MSG91_OTP_BASE_URL?: string;
  MSG91_OTP_HTTP_TIMEOUT_MS?: number;
  MSG91_OTP_HTTP_RETRIES?: number;
  REST_OTP_MSG91_ENABLED?: boolean;
  OTP_BCRYPT_ROUNDS?: number;
  OTP_REST_TTL_SEC?: number;
  OTP_REST_SEND_RATE_LIMIT?: number;
  OTP_REST_SEND_RATE_WINDOW_SEC?: number;
  OTP_REST_MAX_VERIFY_ATTEMPTS?: number;
  OTP_REST_RESEND_COOLDOWN_SEC?: number;
  ZAVUDEV_API_KEY?: string;
  ZAVUDEV_SENDER?: string;
  WHATSAPP_QR_ENABLED?: boolean;
  WHATSAPP_QR_OWN_NUMBER?: string;
};
