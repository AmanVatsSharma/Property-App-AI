/**
 * @file redis-throttle-shutdown.ts
 * @module common/throttler
 * @description Closes Redis connection used for throttler storage on app shutdown.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable, OnApplicationShutdown, Optional, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

export const REDIS_THROTTLE_TOKEN = 'REDIS_THROTTLE';

@Injectable()
export class RedisThrottleShutdown implements OnApplicationShutdown {
  constructor(
    @Optional()
    @Inject(REDIS_THROTTLE_TOKEN)
    private readonly redis: Redis | null,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
