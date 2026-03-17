/**
 * @file main.ts
 * @module api
 * @description NestJS bootstrap; config-driven port, CORS, Helmet, validation.
 * @author BharatERP
 * @created 2025-03-10
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '@api/app/app.module';
import { logger } from '@api/shared/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: '1',
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const corsOrigin = config.get<string>('CORS_ORIGIN') ?? '*';
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  if (isProduction && (corsOrigin === '*' || !corsOrigin.trim())) {
    throw new Error(
      'Production requires CORS_ORIGIN to be set to explicit origin(s). Do not use * (see .env.example).',
    );
  }
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  const port = config.get<number>('PORT') ?? 3333;
  if (isProduction) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret || jwtSecret.trim().length < 16) {
      throw new Error(
        'Production requires JWT_SECRET to be set (min 16 characters). Set in env (see .env.example).',
      );
    }
    const smsProviderRaw = config.get<string>('SMS_PROVIDER');
    const smsProvider = (smsProviderRaw ?? '').trim() || 'stub';
    if (smsProvider === 'stub' || smsProvider === '') {
      throw new Error(
        'Production requires SMS_PROVIDER=twilio or SMS_PROVIDER=msg91. Set provider and credentials (see .env.example).',
      );
    }
  }
  await app.listen(port);
}

bootstrap();
