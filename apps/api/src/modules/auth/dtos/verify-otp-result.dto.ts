/**
 * @file verify-otp-result.dto.ts
 * @module auth
 * @description GraphQL object type for verifyOtp result (JWT token and user profile).
 * @author BharatERP
 * @created 2025-03-12
 */

import { ObjectType, Field } from '@nestjs/graphql';
import { UserRole } from '@api/modules/user/entities/user.entity';

@ObjectType()
export class AuthUserResult {
  @Field()
  id: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  displayName: string | null;

  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class VerifyOtpResult {
  @Field({ description: 'JWT Bearer token for Authorization header' })
  token: string;

  @Field(() => AuthUserResult, { description: 'Current user profile (created or existing)' })
  user: AuthUserResult;
}
