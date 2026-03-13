/**
 * @file otp.service.ts
 * @module auth
 * @description OTP storage and validation (in-memory with TTL); sends via SmsService (Twilio/MSG91 in prod).
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@api/shared/logger';
import { SmsService } from './sms.service';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

interface StoredOtp {
  code: string;
  expiresAt: number;
}

@Injectable()
export class OtpService {
  private store = new Map<string, StoredOtp>();

  constructor(
    private readonly logger: LoggerService,
    private readonly sms: SmsService,
  ) {}

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

  /** Sends OTP via SmsService (Twilio, MSG91, or stub when not configured). */
  async sendOtpToProvider(phone: string, code: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    const message = `Your UrbanNest.ai verification code is ${code}. Valid for 5 minutes.`;
    await this.sms.send(normalized, message);
  }
}
