/**
 * File:        apps/api/src/modules/auth/dto/whatsapp-qr-otp.dto.ts
 * Module:      auth/dto
 * Purpose:     DTOs for WhatsApp QR-based OTP flow (WhatsApp Web scan-to-verify, no Meta Business API).
 *
 * Exports:
 *   - InitWhatsAppQrDto        — POST /auth/otp/whatsapp-qr/init
 *   - VerifyWhatsAppQrDto      — POST /auth/otp/whatsapp-qr/verify
 *   - CleanupWhatsAppQrDto     — POST /auth/otp/whatsapp-qr/cleanup (via query param)
 *
 * Depends on:
 *   - @api/common/decorators/public.decorator — @Public() decorator
 *   - class-validator / class-transformer         — validation decorators
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - phoneNumber must be a valid 10-digit Indian mobile
 *   - sessionId is a 12-char UUID slice used as directory name and Redis key
 *
 * Read order:
 *   1. InitWhatsAppQrDto  — start OTP session, return QR
 *   2. VerifyWhatsAppQrDto — confirm OTP after WhatsApp delivery
 *   3. CleanupWhatsAppQrDto — destroy session / QR scan
 *
 * Author:      BharatERP
 * Last-updated: 2026-05-12
 */

import { IsString, Length, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/** POST /auth/otp/whatsapp-qr/init — start WhatsApp Web session, return QR for user to scan. */
export class InitWhatsAppQrDto {
  @IsString()
  @Length(10, 10, { message: 'phoneNumber must be exactly 10 Indian mobile digits' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  phoneNumber!: string;
}

/** POST /auth/otp/whatsapp-qr/verify — verify the 6-digit OTP delivered via WhatsApp chat. */
export class VerifyWhatsAppQrDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  otp!: string;
}

/** POST /auth/otp/whatsapp-qr/cleanup — destroy an active WhatsApp Web session. */
export class CleanupWhatsAppQrDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
