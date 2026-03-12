/**
 * @file app.module.ts
 * @module api
 * @description Root module: GraphQL (Apollo code-first), TypeORM, and feature modules.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '../shared/config';
import { LoggerModule } from '../shared/logger';
import { HealthModule } from '../modules/health/health.module';
import { PropertyModule } from '../modules/property/property.module';
import { AgentModule } from '../modules/agent/agent.module';
import { RequestIdMiddleware } from '../common/middleware/request-id.middleware';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '../common/interceptors/timeout.interceptor';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'default-secret-min-16-chars',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '7d' },
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: config.get<string>('REDIS_URL') ? { url: config.get<string>('REDIS_URL') } : { host: 'localhost', port: 6379 },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('THROTTLE_TTL') ?? 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
          },
        ],
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        autoSchemaFile: true,
        sortSchema: true,
        playground: config.get<string>('NODE_ENV') !== 'production',
        context: ({ req }: { req: { requestId?: string } }) => ({ req, requestId: req?.requestId }),
        formatError: (formatted: { message: string; extensions?: Record<string, unknown> }, error: unknown) => {
          const orig = error as { extensions?: { code?: string; statusCode?: number }; message?: string };
          if (orig?.extensions?.code != null) {
            return { ...formatted, extensions: { ...formatted.extensions, code: orig.extensions.code, statusCode: orig.extensions.statusCode } };
          }
          return formatted;
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    HealthModule,
    PropertyModule,
    AgentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
