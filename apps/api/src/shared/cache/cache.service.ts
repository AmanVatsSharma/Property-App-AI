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

  /**
   * Fetch from cache; on miss call loader(), cache the result, return it.
   */
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    ttlSeconds: number,
  ): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete all keys matching a prefix (Redis SCAN). No-op in memory mode.
   */
  async delByPrefix(prefix: string): Promise<void> {
    if (!this.redis) return;
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        100,
      );
      cursor = next;
      if (keys.length) await this.redis.del(...keys);
    } while (cursor !== '0');
  }
}
