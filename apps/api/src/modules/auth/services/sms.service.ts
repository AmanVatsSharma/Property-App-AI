/**
 * @file sms.service.ts
 * @module auth
 * @description Sends SMS via configured provider (stub, Twilio, MSG91, or Zavu). No mock in production when provider is set.
 * @author BharatERP
 * @created 2025-03-13
 * @updated 2026-03-28
 */

import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import Zavudev, { APIError } from '@zavudev/sdk';

type SmsProviderType = 'stub' | 'twilio' | 'msg91' | 'zavu';

@Injectable()
export class SmsService {
  private readonly provider: SmsProviderType;
  private readonly twilioAccountSid: string | undefined;
  private readonly twilioAuthToken: string | undefined;
  private readonly twilioFrom: string | undefined;
  private readonly msg91AuthKey: string | undefined;
  private readonly msg91Sender: string;
  private readonly zavuApiKey: string | undefined;
  private readonly zavuSender: string | undefined;
  private zavuClient: Zavudev | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.provider = (this.config.get<string>('SMS_PROVIDER') ?? 'stub') as SmsProviderType;
    this.twilioAccountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioAuthToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioFrom = this.config.get<string>('TWILIO_FROM');
    this.msg91AuthKey = this.config.get<string>('MSG91_AUTH_KEY');
    this.msg91Sender = this.config.get<string>('MSG91_SENDER') ?? 'SMSIND';
    this.zavuApiKey = this.config.get<string>('ZAVUDEV_API_KEY');
    this.zavuSender = this.config.get<string>('ZAVUDEV_SENDER');
  }

  /**
   * @param otpCode Optional 6-digit OTP; used for Zavu idempotency and MSG91 `otp` param (avoids picking digits from e.g. "5 minutes").
   */
  async send(phone: string, message: string, otpCode?: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    if (this.provider === 'twilio' && this.twilioAccountSid && this.twilioAuthToken && this.twilioFrom) {
      await this.sendViaTwilio(normalized, message);
      return;
    }
    if (this.provider === 'msg91' && this.msg91AuthKey) {
      await this.sendViaMsg91(normalized, message, otpCode);
      return;
    }
    if (this.provider === 'zavu' && this.zavuApiKey?.trim()) {
      await this.sendViaZavu(normalized, message, otpCode);
      return;
    }
    const devCodeHint =
      otpCode ?? message.replace(/\D/g, '').match(/\d{6}/)?.[0] ?? message.replace(/\D/g, '').slice(-6);
    this.logger.debug('SMS (stub): OTP not sent — set SMS_PROVIDER and provider credentials for production', {
      phone: normalized,
      code: process.env.NODE_ENV === 'production' ? '***' : devCodeHint,
    });
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[Dev OTP] ${normalized} => ${message}`);
    }
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  }

  /** E.164 for Indian mobile numbers used by Twilio and Zavu. */
  private toE164India(phone: string): string {
    if (phone.startsWith('+')) {
      return phone;
    }
    return phone.length === 10 ? `+91${phone}` : `+91${phone}`;
  }

  private getZavuClient(): Zavudev {
    if (!this.zavuClient) {
      const apiKey = this.zavuApiKey!.trim();
      this.zavuClient = new Zavudev({ apiKey });
    }
    return this.zavuClient;
  }

  private async sendViaZavu(phone: string, message: string, otpCode?: string): Promise<void> {
    const to = this.toE164India(phone);
    const client = this.getZavuClient();
    const trimmedOtp = otpCode?.trim();
    const idempotencyKey = trimmedOtp
      ? `otp-${phone}-${trimmedOtp}`
      : `otp-${phone}-${randomUUID()}`;
    const senderTrimmed = this.zavuSender?.trim();
    try {
      await client.messages.send({
        to,
        channel: 'sms',
        text: message,
        idempotencyKey,
        ...(senderTrimmed ? { 'Zavu-Sender': senderTrimmed } : {}),
      });
      this.logger.debug('Zavu SMS sent', { to: to.slice(-4) });
    } catch (err) {
      if (err instanceof APIError) {
        this.logger.warn('Zavu SMS failed', {
          status: err.status,
          phone: phone.slice(-4),
          detail: err.message,
        });
        throw new Error(`Zavu SMS failed: ${err.status ?? 'unknown'}`);
      }
      throw err;
    }
  }

  private async sendViaTwilio(phone: string, message: string): Promise<void> {
    const sid = this.twilioAccountSid!;
    const token = this.twilioAuthToken!;
    const from = this.twilioFrom!;
    const to = this.toE164India(phone);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: message,
    });
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.warn('Twilio SMS failed', { status: res.status, phone: phone.slice(-4), body: text });
      throw new Error(`Twilio SMS failed: ${res.status}`);
    }
    this.logger.debug('Twilio SMS sent', { to: to.slice(-4) });
  }

  private async sendViaMsg91(phone: string, message: string, otpCode?: string): Promise<void> {
    const authkey = this.msg91AuthKey!;
    const sender = this.msg91Sender;
    const mobile = phone.length === 10 ? `91${phone}` : phone.replace(/\D/g, '');
    const otp =
      otpCode?.trim() && /^\d{6}$/.test(otpCode.trim())
        ? otpCode.trim()
        : message.replace(/\D/g, '').match(/\d{6}/)?.[0] ?? message.replace(/\D/g, '').slice(-6);
    const url = `https://api.msg91.com/api/sendotp.php?authkey=${encodeURIComponent(authkey)}&mobile=${encodeURIComponent(mobile)}&sender=${encodeURIComponent(sender)}&message=${encodeURIComponent(message)}&otp=${encodeURIComponent(otp)}`;
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    let json: { type?: string } | null = null;
    try {
      json = JSON.parse(text) as { type?: string };
    } catch {
      this.logger.warn('MSG91 response not JSON', { status: res.status, body: text.slice(0, 200) });
    }
    if (!res.ok || (json && json.type !== 'success')) {
      this.logger.warn('MSG91 OTP failed', { status: res.status, body: text.slice(0, 200) });
      throw new Error(`MSG91 OTP failed: ${res.status}`);
    }
    this.logger.debug('MSG91 OTP sent', { mobile: mobile.slice(-4) });
  }
}
