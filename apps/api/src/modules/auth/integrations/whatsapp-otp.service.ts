/**
 * @file whatsapp-otp.service.ts
 * @module auth
 * @description WhatsApp Business API integration for OTP delivery via Meta Graph API.
 * Supports template-based OTP messages with delivery status tracking.
 *
 * Exports:
 *   - WhatsAppOtpService — sends OTP via WhatsApp Business API
 *
 * Depends on:
 *   - @api/shared/logger — structured logging
 *   - @nestjs/config — environment variables
 *
 * Side-effects:
 *   - External HTTP call to Meta WhatsApp Business API
 *
 * Key invariants:
 *   - WhatsApp template must be pre-approved in Meta Business Console
 *   - Phone numbers must include country code (e.g., 919876543210)
 *   - Falls back to SMS if WhatsApp delivery fails
 *
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { SmsService } from '../services/sms.service';

interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  fallbackUsed?: boolean;
}

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  templateName: string;
  languageCode: string;
}

@Injectable()
export class WhatsAppOtpService {
  private readonly config: WhatsAppConfig;
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly smsService: SmsService, // for fallback
  ) {
    this.config = {
      accessToken: this.configService.get<string>('WHATSAPP_ACCESS_TOKEN', ''),
      phoneNumberId: this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', ''),
      wabaId: this.configService.get<string>('WHATSAPP_WABA_ID', ''),
      templateName: this.configService.get<string>('WHATSAPP_TEMPLATE_NAME', 'otp_verification'),
      languageCode: this.configService.get<string>('WHATSAPP_LANGUAGE_CODE', 'en'),
    };
  }

  private get isConfigured(): boolean {
    return Boolean(
      this.config.accessToken &&
      this.config.phoneNumberId &&
      this.config.wabaId
    );
  }

  /**
   * Send OTP via WhatsApp Business API
   * @param phone - Phone number with country code (e.g., 919876543210)
   * @param otpCode - 6-digit OTP code
   * @param fallback - Whether to fallback to SMS on failure
   */
  async sendOtp(phone: string, otpCode: string, fallback = true): Promise<WhatsAppSendResult> {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp OTP: Not configured, using stub mode', { phone: this.maskPhone(phone) });
      return { success: false, error: 'WhatsApp not configured', fallbackUsed: false };
    }

    const normalizedPhone = this.normalizePhone(phone);

    try {
      const messageId = await this.sendTemplateMessage(normalizedPhone, otpCode);
      this.logger.debug('WhatsApp OTP sent', {
        phone: this.maskPhone(normalizedPhone),
        messageId,
      });
      return { success: true, messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('WhatsApp OTP failed', {
        phone: this.maskPhone(normalizedPhone),
        error: errorMessage,
      });

      // Fallback to SMS if enabled
      if (fallback) {
        try {
          await this.smsService.send(
            normalizedPhone,
            `Your UrbanNest OTP is: ${otpCode}`,
            otpCode
          );
          this.logger.debug('WhatsApp OTP fallback to SMS succeeded', {
            phone: this.maskPhone(normalizedPhone)
          });
          return { success: true, error: 'WhatsApp failed, SMS fallback used', fallbackUsed: true };
        } catch (smsError) {
          const smsErrorMsg = smsError instanceof Error ? smsError.message : 'Unknown error';
          this.logger.error('SMS fallback also failed', smsErrorMsg, {
            phone: this.maskPhone(normalizedPhone),
          });
          return { success: false, error: 'Both WhatsApp and SMS failed' };
        }
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send template message via WhatsApp Graph API
   */
  private async sendTemplateMessage(phone: string, otpCode: string): Promise<string> {
    const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: this.config.templateName,
        language: {
          code: this.config.languageCode,
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: otpCode,
              },
            ],
          },
          {
            type: 'button',
            sub_type: 'otp',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: otpCode,
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`WhatsApp API error: ${response.status} - ${errorBody}`);
    }

    const result = await response.json() as { messages?: Array<{ id: string }> };
    const messageId = result.messages?.[0]?.id;

    if (!messageId) {
      throw new Error('No message ID returned from WhatsApp API');
    }

    return messageId;
  }

  /**
   * Verify delivery status of sent message
   */
  async checkDeliveryStatus(messageId: string): Promise<'delivered' | 'read' | 'failed' | 'unknown'> {
    if (!this.isConfigured) {
      return 'unknown';
    }

    try {
      const url = `${this.baseUrl}/${messageId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        return 'unknown';
      }

      const result = await response.json() as { status?: string };
      const status = result.status?.toLowerCase();

      if (status === 'delivered' || status === 'sent') return 'delivered';
      if (status === 'read') return 'read';
      if (status === 'failed' || status === 'undelivered') return 'failed';

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Normalize phone number to country code format
   */
  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    // If 10 digits (Indian), add 91
    if (digits.length === 10) {
      return `91${digits}`;
    }
    // If already 12 digits (91 + 10), return as-is
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits;
    }
    // Otherwise, just return digits
    return digits;
  }

  /**
   * Mask phone for logging (show last 4 digits only)
   */
  private maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return `****${phone.slice(-4)}`;
  }
}