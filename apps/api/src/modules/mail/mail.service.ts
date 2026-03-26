/**
 * @file mail.service.ts
 * @module mail
 * @description Email delivery via Nodemailer (SMTP). No-op in stub mode.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null = null;
  private readonly from: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.from = config.get<string>('SMTP_FROM') ?? 'KonKreet <noreply@urbannest.ai>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT') ?? 587,
        secure: config.get<boolean>('SMTP_SECURE') ?? false,
        auth: { user, pass },
      });
    }
  }

  async send(payload: MailPayload): Promise<void> {
    if (!this.transporter) {
      this.logger.debug('MailService stub — email not sent (SMTP not configured)', {
        to: payload.to,
        subject: payload.subject,
      });
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
      this.logger.debug('MailService sent', { to: payload.to, subject: payload.subject });
    } catch (err) {
      this.logger.warn('MailService send failed', {
        to: payload.to,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
