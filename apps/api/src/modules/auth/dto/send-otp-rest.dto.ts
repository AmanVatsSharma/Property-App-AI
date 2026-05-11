/**
 * @file send-otp-rest.dto.ts
 * @module auth
 * @description Body for POST /auth/otp/send (REST MSG91 v5 flow).
 * @author BharatERP
 * @created 2026-03-28
 */

import { IsString, Matches, MinLength } from 'class-validator';

export class SendOtpRestDto {
  @IsString()
  @MinLength(10)
  @Matches(/^\+?[0-9\s-]{10,15}$/, { message: 'Invalid phoneNumber format' })
  phoneNumber!: string;
}
