/**
 * @file cache.service.ts
 * @module shared/cache
 * @description Redis-backed cache with get/set/del; no-op when Redis unavailable.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable, Optional, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_THROTTLE_TOKEN } from '@api/common/throttler/redis-throttle-shutdown';

@Injectable()
export class CacheService {
  constructor(
    @Optional()
    @Inject(REDIS_THROTTLE_TOKEN)
    private readonly redis: Redis | null,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    const val = await this.redis.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(key);
  }
}
