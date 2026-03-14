/**
 * @file config.module.ts
 * @module shared/config
 * @description Global config module with env validation (Joi). Loads apps/api/.env then root .env.
 * @author BharatERP
 * @created 2025-03-10
 */

import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

const cwd = process.cwd();
// App-level .env overrides root .env (first in array has precedence in @nestjs/config).
const envPaths = [
  join(cwd, 'apps', 'api', '.env'),
  join(cwd, '.env'),
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
