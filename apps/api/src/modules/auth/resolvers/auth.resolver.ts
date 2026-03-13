/**
 * @file auth.resolver.ts
 * @module auth
 * @description GraphQL resolver for sendOtp and verifyOtp (mobile + OTP sign-in).
 * @author BharatERP
 * @created 2025-03-12
 */

import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Public } from '@api/common/decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { SendOtpInput } from '../dtos/send-otp.dto';
import { VerifyOtpInput } from '../dtos/verify-otp.dto';
import { SendOtpResult } from '../dtos/send-otp-result.dto';
import { VerifyOtpResult } from '../dtos/verify-otp-result.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => SendOtpResult)
  async sendOtp(@Args('input') input: SendOtpInput): Promise<SendOtpResult> {
    return this.authService.sendOtp(input.phone);
  }

  @Public()
  @Mutation(() => VerifyOtpResult)
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<VerifyOtpResult> {
    return this.authService.verifyOtp(input.phone, input.code);
  }
}
