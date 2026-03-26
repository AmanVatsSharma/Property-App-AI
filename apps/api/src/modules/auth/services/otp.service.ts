/**
 * @file otp.service.ts
 * @module auth
 * @description OTP storage and validation (Redis or in-memory via OtpStoreService); sends via SmsService (Twilio/MSG91 in prod).
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@api/shared/logger';
import { SmsService } from './sms.service';
import { OtpStoreService } from './otp-store.service';

const OTP_LENGTH = 6;

@Injectable()
export class OtpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sms: SmsService,
    private readonly otpStore: OtpStoreService,
  ) {}

  generateCode(): string {
    const digits = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10));
    return digits.join('');
  }

  async set(phone: string, code: string): Promise<void> {
    await this.otpStore.set(this.normalizePhone(phone), code);
  }

  async verify(phone: string, code: string): Promise<boolean> {
    return this.otpStore.verify(this.normalizePhone(phone), code);
  }

  async get(phone: string): Promise<string | null> {
    return this.otpStore.get(this.normalizePhone(phone));
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
    const message = `Your KonKreet verification code is ${code}. Valid for 5 minutes.`;
    await this.sms.send(normalized, message);
  }
}
