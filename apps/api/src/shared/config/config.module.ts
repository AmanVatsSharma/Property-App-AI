/**
 * @file config.module.ts
 * @module shared/config
 * @description Global config module with env validation (Joi). Loads apps/api/.env then root .env.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26 Switch from __dirname-relative to process.cwd()-relative paths so the
 *   same resolution logic works in both dev (src/) and production (dist/) layouts.
 */

import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

// process.cwd() is always the monorepo root when the API is started via Nx or the
// root-level npm scripts (e.g. `nx run api:serve`, `node dist/apps/api/main.js`).
// This is stable across src/ (ts-node/swc) and dist/ (compiled) execution contexts,
// unlike __dirname which changes depth when TypeScript compiles into dist/.
const cwd = process.cwd();
const cwdIsApiRoot =
  cwd.endsWith('apps/api') || cwd.endsWith('apps\\api');

// Determine monorepo root regardless of whether we're run from repo root or apps/api/
const repoRoot = cwdIsApiRoot ? resolve(cwd, '../..') : cwd;
const apiRoot = cwdIsApiRoot ? cwd : resolve(cwd, 'apps/api');

// App-level .env overrides root .env (first in array has precedence in @nestjs/config).
const envPaths = [
  resolve(apiRoot, '.env'),   // apps/api/.env  (app-level wins)
  resolve(repoRoot, '.env'),  // repo root .env (fallback defaults)
];

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPaths,
      validationSchema: envSchema,
      validationOptions: { abortEarly: true },
    }),
  ],
})
export class AppConfigModule {}
