/**
 * @file send-otp.dto.ts
 * @module auth
 * @description GraphQL input for sendOtp mutation.
 * @author BharatERP
 * @created 2025-03-12
 */

import { InputType, Field } from '@nestjs/graphql';
import { IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class SendOtpInput {
  @Field({ description: 'Indian mobile number (10 digits, optional +91)' })
  @IsString()
  @MinLength(10)
  @Matches(/^\+?[0-9\s-]{10,15}$/, { message: 'Invalid phone format' })
  phone: string;
}
