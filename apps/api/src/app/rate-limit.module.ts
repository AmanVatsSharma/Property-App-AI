/**
 * @file rate-limit.module.ts
 * @module api
 * @description Provides Redis-backed throttling and agent rate limit store when REDIS_URL is set.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisThrottlerStorage } from '@api/common/throttler/redis-throttler.storage';
import {
  REDIS_THROTTLE_TOKEN,
  RedisThrottleShutdown,
} from '@api/common/throttler/redis-throttle-shutdown';
import { AgentRateLimitStore } from '@api/common/guards/agent-rate-limit.store';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_THROTTLE_TOKEN,
      useFactory: (config: ConfigService): Redis | null => {
        const url = config.get<string>('REDIS_URL');
        if (!url?.trim()) return null;
        return new Redis(url);
      },
      inject: [ConfigService],
    },
    {
      provide: RedisThrottlerStorage,
      useFactory: (redis: Redis | null): RedisThrottlerStorage | null =>
        redis ? new RedisThrottlerStorage(redis) : null,
      inject: [{ token: REDIS_THROTTLE_TOKEN, optional: true }],
    },
    RedisThrottleShutdown,
    AgentRateLimitStore,
  ],
  exports: [RedisThrottlerStorage, AgentRateLimitStore],
})
export class RateLimitModule {}
