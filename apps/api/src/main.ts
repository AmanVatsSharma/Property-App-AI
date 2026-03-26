/**
 * @file main.ts
 * @module api
 * @description NestJS bootstrap; compression, CORS, Helmet, validation, WS adapter.
 * @author BharatERP
 * @created 2025-03-10
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@api/app/app.module';
import { logger } from '@api/shared/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // ── WebSocket adapter (required for notification gateway) ──
  try {
    const { IoAdapter } = await import('@nestjs/platform-socket.io');
    const wsOriginRaw =
      config.get<string>('WS_CORS_ORIGIN') ??
      config.get<string>('CORS_ORIGIN') ??
      (isProduction ? '' : '*');
    const wsOrigin = wsOriginRaw.includes(',')
      ? wsOriginRaw.split(',').map((o) => o.trim()).filter(Boolean)
      : wsOriginRaw;
    // Extend IoAdapter to set CORS at the socket.io server level
    class CorsIoAdapter extends IoAdapter {
      override createIOServer(port: number, options?: Record<string, unknown>) {
        return super.createIOServer(port, { ...options, cors: { origin: wsOrigin, credentials: true } });
      }
    }
    app.useWebSocketAdapter(new CorsIoAdapter(app));
  } catch {
    logger.warn('socket.io adapter not available — real-time notifications disabled');
  }

  // ── Compression ──
  try {
    const compression = (await import('compression')).default;
    app.use(compression());
  } catch {
    logger.warn('compression package not available — skipping');
  }

  // ── Security ──
  app.use(
    helmet({
      contentSecurityPolicy: isProduction,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableShutdownHooks();

  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: '1',
  });

  // ── Validation ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ──
  const corsOriginRaw = config.get<string>('CORS_ORIGIN') ?? '*';
  if (isProduction && (corsOriginRaw === '*' || !corsOriginRaw.trim())) {
    throw new Error('Production requires CORS_ORIGIN to be set to explicit origin(s).');
  }
  const corsOrigins = corsOriginRaw.includes(',')
    ? corsOriginRaw.split(',').map((o) => o.trim()).filter(Boolean)
    : corsOriginRaw;

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  });

  // ── Swagger ──
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('UrbanNest.ai API')
      .setDescription('AI-powered real estate API for Indian markets')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  // ── Production guards ──
  if (isProduction) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret || jwtSecret.trim().length < 16) {
      throw new Error('Production requires JWT_SECRET (min 16 chars).');
    }
    const smsProvider = (config.get<string>('SMS_PROVIDER') ?? '').trim();
    if (!smsProvider || smsProvider === 'stub') {
      throw new Error('Production requires SMS_PROVIDER=twilio or msg91.');
    }
  }

  const port = config.get<number>('PORT') ?? 3333;
  await app.listen(port);
  logger.info(`API running on port ${port} [${isProduction ? 'production' : 'development'}]`);
}

bootstrap().catch((err) => {
  logger.error(
    {
      err: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    },
    'Bootstrap failed',
  );
  process.exit(1);
});
