/**
 * @file redis-throttler.storage.ts
 * @module common/throttler
 * @description Redis-backed ThrottlerStorage for multi-instance rate limiting when REDIS_URL is set.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { ThrottlerStorage } from '@nestjs/throttler';

/** Aligns with ThrottlerStorage.increment return shape (@nestjs/throttler v6). */
type ThrottlerIncrementResult = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

const THROTTLER_PREFIX = 'throttler:';
const BLOCK_PREFIX = 'throttler:block:';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerIncrementResult> {
    const countKey = THROTTLER_PREFIX + key;
    const blockKey = BLOCK_PREFIX + key;
    const ttlSec = Math.max(1, Math.ceil(ttl / 1000));
    const blockSec = Math.max(1, Math.ceil(blockDuration / 1000));

    const count = await this.redis.incr(countKey);
    if (count === 1) {
      await this.redis.expire(countKey, ttlSec);
    }
    const timeToExpire = await this.redis.ttl(countKey);
    const isBlocked = count > limit;
    if (isBlocked) {
      await this.redis.set(blockKey, '1', 'EX', blockSec);
    }
    const timeToBlockExpire = await this.redis.ttl(blockKey);
    return {
      totalHits: count,
      timeToExpire: timeToExpire > 0 ? timeToExpire : 0,
      isBlocked,
      timeToBlockExpire: timeToBlockExpire > 0 ? timeToBlockExpire : 0,
    };
  }
}
