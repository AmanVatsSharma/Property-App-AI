/**
 * @file verify-otp-rest.dto.ts
 * @module auth
 * @description Body for POST /auth/otp/verify (REST MSG91 v5 flow).
 * @author BharatERP
 * @created 2026-03-28
 */

import { IsString, Length, Matches, MinLength } from 'class-validator';

export class VerifyOtpRestDto {
  @IsString()
  @MinLength(10)
  @Matches(/^\+?[0-9\s-]{10,15}$/, { message: 'Invalid phoneNumber format' })
  phoneNumber!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp!: string;
}
