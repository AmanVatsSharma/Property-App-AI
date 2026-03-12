/**
 * @file otp.service.ts
 * @module auth
 * @description OTP storage and validation (in-memory with TTL); dev stub for send.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../shared/logger';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

interface StoredOtp {
  code: string;
  expiresAt: number;
}

@Injectable()
export class OtpService {
  private store = new Map<string, StoredOtp>();

  constructor(private readonly logger: LoggerService) {}

  generateCode(): string {
    const digits = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10));
    return digits.join('');
  }

  set(phone: string, code: string): void {
    this.store.set(this.normalizePhone(phone), {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
  }

  verify(phone: string, code: string): boolean {
    const key = this.normalizePhone(phone);
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return false;
    const ok = entry.code === code;
    if (ok) this.store.delete(key);
    return ok;
  }

  get(phone: string): string | null {
    const entry = this.store.get(this.normalizePhone(phone));
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.code;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  /** Validate Indian mobile: 10 digits, optional +91 prefix */
  validatePhone(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    return normalized.length === 10 && /^[6-9]/.test(normalized);
  }

  /** Stub: in dev log OTP to console; in prod would call Twilio/MSG91 */
  sendOtpToProvider(phone: string, code: string): Promise<void> {
    this.logger.debug('OTP generated (stub; in production wire SMS provider)', {
      phone: this.normalizePhone(phone),
      code: process.env.NODE_ENV === 'production' ? '***' : code,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Dev OTP] ${this.normalizePhone(phone)} => ${code}`);
    }
    return Promise.resolve();
  }
}
