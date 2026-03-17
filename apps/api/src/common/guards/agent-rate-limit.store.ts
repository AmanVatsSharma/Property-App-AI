/**
 * @file agent-rate-limit.store.ts
 * @module common/guards
 * @description Per-IP rate limit store for agent mutations. Uses Redis when REDIS_URL is set, else in-memory.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Injectable, Optional, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_THROTTLE_TOKEN } from '@api/common/throttler/redis-throttle-shutdown';

const AGENT_RL_PREFIX = 'agent_rl:';
const TTL_MS = 60_000;

interface Slot {
  count: number;
  resetAt: number;
}

@Injectable()
export class AgentRateLimitStore {
  private readonly memory = new Map<string, Slot>();

  constructor(
    @Optional()
    @Inject(REDIS_THROTTLE_TOKEN)
    private readonly redis: Redis | null,
  ) {}

  async incrementAndCheck(ip: string, limit: number): Promise<boolean> {
    if (this.redis) {
      const key = AGENT_RL_PREFIX + ip;
      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.pexpire(key, TTL_MS);
      }
      return count <= limit;
    }
    const now = Date.now();
    let slot = this.memory.get(ip);
    if (!slot || now >= slot.resetAt) {
      slot = { count: 0, resetAt: now + TTL_MS };
      this.memory.set(ip, slot);
    }
    slot.count += 1;
    return slot.count <= limit;
  }
}
