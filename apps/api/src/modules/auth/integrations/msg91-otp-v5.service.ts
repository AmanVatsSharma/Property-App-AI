/**
 * @file msg91-otp-v5.service.ts
 * @module auth
 * @description MSG91 Control API v5 OTP send (template-based) with timeout and retries. Verification is local (bcrypt) after delivery.
 * @author BharatERP
 * @created 2026-03-28
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { LoggerService } from '@api/shared/logger';
import { maskIndianPhone } from '../utils/mask-phone.util';

export interface Msg91OtpSendResult {
  requestId: string | null;
  rawType?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class Msg91OtpV5Service {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Sends OTP via MSG91 v5 POST /otp. Server supplies OTP so verification stays in-app (Redis + bcrypt).
   * @see https://docs.msg91.com/reference/sendotp
   */
  async sendOtp(params: { mobile91E164: string; otp: string; templateId: string }): Promise<Msg91OtpSendResult> {
    const authkey = this.config.get<string>('MSG91_AUTH_KEY')?.trim();
    if (!authkey) {
      throw new Error('MSG91_AUTH_KEY is not configured');
    }
    const baseUrl = (this.config.get<string>('MSG91_OTP_BASE_URL') ?? 'https://control.msg91.com/api/v5').replace(
      /\/$/,
      '',
    );
    const timeout = this.config.get<number>('MSG91_OTP_HTTP_TIMEOUT_MS') ?? 15_000;
    const maxRetries = this.config.get<number>('MSG91_OTP_HTTP_RETRIES') ?? 2;
    const ttlMin = Math.max(1, Math.ceil((this.config.get<number>('OTP_REST_TTL_SEC') ?? 300) / 60));
    const otpLength = 6;
    const url = `${baseUrl}/otp`;
    const body: Record<string, string | number> = {
      template_id: params.templateId,
      mobile: params.mobile91E164,
      otp: params.otp,
      otp_length: otpLength,
      otp_expiry: ttlMin,
    };
    let lastErr: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await axios.post<Record<string, unknown>>(url, body, {
          timeout,
          headers: {
            'Content-Type': 'application/json',
            Authkey: authkey,
          },
          validateStatus: () => true,
        });
        const data = res.data ?? {};
        const type = typeof data.type === 'string' ? data.type : '';
        const requestId =
          (typeof data.request_id === 'string' && data.request_id) ||
          (typeof data.reqId === 'string' && data.reqId) ||
          null;
        if (res.status >= 200 && res.status < 300 && type === 'success') {
          this.logger.debug('MSG91 v5 OTP sent', {
            phoneMask: maskIndianPhone(params.mobile91E164),
            requestId: requestId ?? undefined,
          });
          return { requestId, rawType: type };
        }
        const msg = typeof data.message === 'string' ? data.message : JSON.stringify(data);
        this.logger.warn('MSG91 v5 OTP unexpected response', {
          status: res.status,
          phoneMask: maskIndianPhone(params.mobile91E164),
          bodyPreview: msg.slice(0, 200),
        });
        throw new Error(`MSG91 send failed: ${res.status} ${msg}`);
      } catch (err) {
        lastErr = err;
        if (attempt < maxRetries) {
          const delay = 300 * (attempt + 1);
          this.logger.warn('MSG91 v5 OTP retry', {
            attempt: attempt + 1,
            phoneMask: maskIndianPhone(params.mobile91E164),
            detail: err instanceof AxiosError ? err.code : String(err),
          });
          await sleep(delay);
          continue;
        }
      }
    }
    const detail =
      lastErr instanceof AxiosError
        ? `${lastErr.code ?? lastErr.message} ${lastErr.response?.data ? JSON.stringify(lastErr.response.data).slice(0, 200) : ''}`
        : String(lastErr);
    this.logger.warn('MSG91 v5 OTP exhausted retries', {
      phoneMask: maskIndianPhone(params.mobile91E164),
      detail,
    });
    throw new Error(`MSG91 OTP send failed after retries: ${detail}`);
  }
}
