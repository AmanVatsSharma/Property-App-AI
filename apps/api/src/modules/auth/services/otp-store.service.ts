/**
 * @file otp-store.service.ts
 * @module auth
 * @description OTP store: Redis-backed when REDIS_URL set, in-memory fallback otherwise.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable, Optional, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { REDIS_THROTTLE_TOKEN } from '@api/common/throttler/redis-throttle-shutdown';

const OTP_TTL_SEC = 300; // 5 minutes
const OTP_PREFIX = 'otp:';

interface MemSlot {
  code: string;
  expiresAt: number;
}

@Injectable()
export class OtpStoreService {
  private readonly memory = new Map<string, MemSlot>();

  constructor(
    @Optional()
    @Inject(REDIS_THROTTLE_TOKEN)
    private readonly redis: Redis | null,
  ) {}

  async set(phone: string, code: string): Promise<void> {
    if (this.redis) {
      await this.redis.set(OTP_PREFIX + phone, code, 'EX', OTP_TTL_SEC);
      return;
    }
    this.memory.set(phone, { code, expiresAt: Date.now() + OTP_TTL_SEC * 1000 });
  }

  async verify(phone: string, code: string): Promise<boolean> {
    if (this.redis) {
      const stored = await this.redis.get(OTP_PREFIX + phone);
      if (!stored || stored !== code) return false;
      await this.redis.del(OTP_PREFIX + phone);
      return true;
    }
    const slot = this.memory.get(phone);
    if (!slot || Date.now() > slot.expiresAt) return false;
    if (slot.code !== code) return false;
    this.memory.delete(phone);
    return true;
  }

  async get(phone: string): Promise<string | null> {
    if (this.redis) {
      return this.redis.get(OTP_PREFIX + phone);
    }
    const slot = this.memory.get(phone);
    if (!slot || Date.now() > slot.expiresAt) return null;
    return slot.code;
  }
}
