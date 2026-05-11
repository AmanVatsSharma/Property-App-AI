/**
 * @file rest-otp.service.ts
 * @module auth
 * @description REST OTP flow: bcrypt in Redis, MSG91 v5 delivery, rate limits, verify attempts, JWT via AuthService.finalizeMobileLogin.
 * @author BharatERP
 * @created 2026-03-28
 */

import { randomInt } from 'crypto';
import { Injectable, BadRequestException, ServiceUnavailableException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '@api/shared/logger';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { OtpSessionRedisRepository } from './otp-session-redis.repository';
import { Msg91OtpV5Service } from '../integrations/msg91-otp-v5.service';
import { maskIndianPhone, maskIndianPhoneE164, normalizeIndianLocal10 } from '../utils/mask-phone.util';

@Injectable()
export class RestOtpService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly auth: AuthService,
    private readonly otpService: OtpService,
    private readonly sessionRepo: OtpSessionRedisRepository,
    private readonly msg91: Msg91OtpV5Service,
  ) {}

  private assertRestOtpEnabled(): void {
    if (this.config.get<string>('REST_OTP_MSG91_ENABLED') === 'false') {
      throw new ServiceUnavailableException('REST MSG91 OTP is disabled');
    }
    const templateId = this.config.get<string>('MSG91_TEMPLATE_ID')?.trim();
    if (!templateId) {
      throw new ServiceUnavailableException('MSG91_TEMPLATE_ID is required for REST OTP');
    }
    if (!this.sessionRepo.isAvailable()) {
      throw new ServiceUnavailableException('Redis (REDIS_URL) is required for REST OTP');
    }
  }

  async sendOtp(phoneNumber: string): Promise<{ requestId: string | null; maskedPhone: string }> {
    this.assertRestOtpEnabled();
    if (!this.otpService.validatePhone(phoneNumber)) {
      throw new BadRequestException('Invalid Indian mobile number (10 digits, starting 6-9)');
    }
    const phone10 = normalizeIndianLocal10(phoneNumber);
    const ttlSec = this.config.get<number>('OTP_REST_TTL_SEC') ?? 300;
    const rlMax = this.config.get<number>('OTP_REST_SEND_RATE_LIMIT') ?? 5;
    const rlWindow = this.config.get<number>('OTP_REST_SEND_RATE_WINDOW_SEC') ?? 600;
    const cooldown = this.config.get<number>('OTP_REST_RESEND_COOLDOWN_SEC') ?? 60;

    const rl = await this.sessionRepo.consumeSendSlot(phone10, rlMax, rlWindow);
    if (!rl.allowed) {
      throw new HttpException(
        { message: 'Too many OTP requests for this number', retryAfterSec: rl.retryAfterSec },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const existing = await this.sessionRepo.getSession(phone10);
    if (existing) {
      const wait = await this.sessionRepo.getResendCooldownRemainingSec(phone10);
      if (wait > 0) {
        throw new HttpException(
          { message: 'Wait before requesting another OTP', retryAfterSec: wait },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otp = String(randomInt(100_000, 1_000_000));
    const rounds = this.config.get<number>('OTP_BCRYPT_ROUNDS') ?? 10;
    const hash = await bcrypt.hash(otp, rounds);
    const templateId = this.config.get<string>('MSG91_TEMPLATE_ID')!.trim();
    const mobile91 = `91${phone10}`;

    const { requestId } = await this.msg91.sendOtp({
      mobile91E164: mobile91,
      otp,
      templateId,
    });

    await this.sessionRepo.saveSession(phone10, { hash, requestId }, ttlSec);
    await this.sessionRepo.clearVerifyFailures(phone10);
    await this.sessionRepo.setResendCooldown(phone10, cooldown);

    this.logger.debug('restOtp.send', { phoneMask: maskIndianPhone(phone10), requestId: requestId ?? undefined });
    return {
      requestId,
      maskedPhone: maskIndianPhoneE164(phone10),
    };
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<{ accessToken: string; user: { id: string; phone: string; displayName: string | null; role: string } }> {
    this.assertRestOtpEnabled();
    if (!this.otpService.validatePhone(phoneNumber)) {
      throw new BadRequestException('Invalid Indian mobile number (10 digits, starting 6-9)');
    }
    const phone10 = normalizeIndianLocal10(phoneNumber);
    const ttlSec = this.config.get<number>('OTP_REST_TTL_SEC') ?? 300;
    const maxAttempts = this.config.get<number>('OTP_REST_MAX_VERIFY_ATTEMPTS') ?? 3;

    const session = await this.sessionRepo.getSession(phone10);
    if (!session) {
      throw new BadRequestException('OTP expired or not found');
    }

    const fails = await this.sessionRepo.getVerifyFailures(phone10);
    if (fails >= maxAttempts) {
      await this.sessionRepo.deleteSession(phone10);
      await this.sessionRepo.clearVerifyFailures(phone10);
      await this.sessionRepo.clearResendCooldown(phone10);
      throw new BadRequestException('Too many invalid attempts. Request a new OTP.');
    }

    const ok = await bcrypt.compare(otp, session.hash);
    if (!ok) {
      const n = await this.sessionRepo.incrementVerifyFailures(phone10, ttlSec);
      this.logger.warn('restOtp.verify failed', { phoneMask: maskIndianPhone(phone10), attempts: n });
      if (n >= maxAttempts) {
        await this.sessionRepo.deleteSession(phone10);
        await this.sessionRepo.clearVerifyFailures(phone10);
        await this.sessionRepo.clearResendCooldown(phone10);
        throw new BadRequestException('Too many invalid attempts. Request a new OTP.');
      }
      throw new BadRequestException('Invalid OTP');
    }

    await this.sessionRepo.deleteSession(phone10);
    await this.sessionRepo.clearVerifyFailures(phone10);
    await this.sessionRepo.clearResendCooldown(phone10);

    const { token, user } = await this.auth.finalizeMobileLogin(phone10);
    return { accessToken: token, user };
  }

  async resendOtp(phoneNumber: string): Promise<{ requestId: string | null; maskedPhone: string }> {
    this.assertRestOtpEnabled();
    if (!this.otpService.validatePhone(phoneNumber)) {
      throw new BadRequestException('Invalid Indian mobile number (10 digits, starting 6-9)');
    }
    const phone10 = normalizeIndianLocal10(phoneNumber);
    const existing = await this.sessionRepo.getSession(phone10);
    if (!existing) {
      throw new BadRequestException('No active OTP session; use send first');
    }
    return this.sendOtp(phoneNumber);
  }
}
