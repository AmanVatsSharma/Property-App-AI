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
import { AppConfigModule } from '@api/shared/config';
import { LoggerModule } from '@api/shared/logger';
import { HealthModule } from '@api/modules/health/health.module';
import { AuthModule } from '@api/modules/auth/auth.module';
import { UserModule } from '@api/modules/user/user.module';
import { PropertyModule } from '@api/modules/property/property.module';
import { AgentModule } from '@api/modules/agent/agent.module';
import { AreaModule } from '@api/modules/area/area.module';
import { StorageModule } from '@api/modules/storage/storage.module';
import { AdminModule } from '@api/modules/admin/admin.module';
import { AppError } from '@api/common/errors';
import { RequestIdMiddleware } from '@api/common/middleware/request-id.middleware';
import { HttpExceptionFilter } from '@api/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@api/common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '@api/common/interceptors/timeout.interceptor';
import { AuthGuard } from '@api/common/guards/auth.guard';

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
        formatError: (formatted: { message: string; extensions?: Record<string, unknown>; originalError?: unknown }, error?: unknown) => {
          const raw = (formatted?.originalError ?? error) as unknown;
          if (raw instanceof AppError) {
            return {
              ...formatted,
              message: raw.message,
              extensions: { ...formatted.extensions, code: raw.code, statusCode: raw.statusCode },
            };
          }
          const orig = (formatted ?? error) as { extensions?: { code?: string; statusCode?: number } };
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
    AuthModule,
    UserModule,
    PropertyModule,
    AgentModule,
    AreaModule,
    StorageModule,
    AdminModule,
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
