/**
 * @file config.module.ts
 * @module shared/config
 * @description Global config module with env validation (Joi).
 * @author BharatERP
 * @created 2025-03-10
 */

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      validationOptions: { abortEarly: true },
    }),
  ],
})
export class AppConfigModule {}
