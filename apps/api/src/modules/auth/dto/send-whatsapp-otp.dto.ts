/**
 * @file send-whatsapp-otp.dto.ts
 * @module auth
 * @description DTO for sending OTP via WhatsApp
 *
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

export class SendWhatsAppOtpDto {
  @IsString()
  @IsPhoneNumber('IN')
  phoneNumber!: string;

  @IsOptional()
  @IsBoolean()
  forceSmsFallback?: boolean;
}