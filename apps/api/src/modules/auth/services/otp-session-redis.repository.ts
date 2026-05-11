/**
 * @file otp-session-redis.repository.ts
 * @module auth
 * @description Redis persistence for REST OTP: bcrypt hash, MSG91 requestId, verify-attempt counters, send rate limit, resend cooldown.
 * @author BharatERP
 * @created 2026-03-28
 */

import { Inject, Injectable, Optional } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_THROTTLE_TOKEN } from '@api/common/throttler/redis-throttle-shutdown';

const PREFIX_SESSION = 'otp:rest:session:';
const PREFIX_VERIFY_FAIL = 'otp:rest:vf:';
const PREFIX_SEND_RL = 'otp:rest:rl:send:';
const PREFIX_RESEND = 'otp:rest:resend:';

export type OtpRestSessionPayload = {
  hash: string;
  requestId: string | null;
};

@Injectable()
export class OtpSessionRedisRepository {
  constructor(
    @Optional()
    @Inject(REDIS_THROTTLE_TOKEN)
    private readonly redis: Redis | null,
  ) {}

  isAvailable(): boolean {
    return this.redis != null;
  }

  private client(): Redis {
    if (!this.redis) {
      throw new Error('Redis is required for REST OTP session store');
    }
    return this.redis;
  }

  async saveSession(phone10: string, payload: OtpRestSessionPayload, ttlSec: number): Promise<void> {
    await this.client().set(PREFIX_SESSION + phone10, JSON.stringify(payload), 'EX', ttlSec);
  }

  async getSession(phone10: string): Promise<OtpRestSessionPayload | null> {
    const raw = await this.client().get(PREFIX_SESSION + phone10);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as OtpRestSessionPayload;
    } catch {
      return null;
    }
  }

  async deleteSession(phone10: string): Promise<void> {
    await this.client().del(PREFIX_SESSION + phone10);
  }

  async getVerifyFailures(phone10: string): Promise<number> {
    const v = await this.client().get(PREFIX_VERIFY_FAIL + phone10);
    return v ? parseInt(v, 10) || 0 : 0;
  }

  /** Increments failure count; expires with same window as OTP session once first failure recorded. */
  async incrementVerifyFailures(phone10: string, ttlSec: number): Promise<number> {
    const r = this.client();
    const key = PREFIX_VERIFY_FAIL + phone10;
    const n = await r.incr(key);
    if (n === 1) {
      await r.expire(key, ttlSec);
    }
    return n;
  }

  async clearVerifyFailures(phone10: string): Promise<void> {
    await this.client().del(PREFIX_VERIFY_FAIL + phone10);
  }

  /**
   * Fixed-window send rate limit per phone.
   * @returns allowed true if under max; else retryAfterSec from TTL
   */
  async consumeSendSlot(phone10: string, max: number, windowSec: number): Promise<{ allowed: boolean; retryAfterSec?: number }> {
    const r = this.client();
    const key = PREFIX_SEND_RL + phone10;
    const n = await r.incr(key);
    if (n === 1) {
      await r.expire(key, windowSec);
    }
    if (n > max) {
      const ttl = await r.ttl(key);
      return { allowed: false, retryAfterSec: ttl > 0 ? ttl : windowSec };
    }
    return { allowed: true };
  }

  /** Cooldown before another send/resend for the same pending flow. */
  async setResendCooldown(phone10: string, cooldownSec: number): Promise<void> {
    await this.client().set(PREFIX_RESEND + phone10, '1', 'EX', cooldownSec);
  }

  async getResendCooldownRemainingSec(phone10: string): Promise<number> {
    return this.client().ttl(PREFIX_RESEND + phone10);
  }

  async clearResendCooldown(phone10: string): Promise<void> {
    await this.client().del(PREFIX_RESEND + phone10);
  }
}
