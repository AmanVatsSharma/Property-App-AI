/**
 * @file send-otp-result.dto.ts
 * @module auth
 * @description GraphQL object type for sendOtp result.
 * @author BharatERP
 * @created 2025-03-12
 */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SendOtpResult {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
