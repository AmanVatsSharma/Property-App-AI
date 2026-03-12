/**
 * @file verify-otp.dto.ts
 * @module auth
 * @description GraphQL input for verifyOtp mutation.
 * @author BharatERP
 * @created 2025-03-12
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length, Matches, MinLength } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field({ description: 'Indian mobile number (same as sendOtp)' })
  @IsString()
  @MinLength(10)
  phone: string;

  @Field({ description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/)
  code: string;
}
