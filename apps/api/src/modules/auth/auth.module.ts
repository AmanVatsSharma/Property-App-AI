/**
 * @file auth.module.ts
 * @module auth
 * @description Auth module: OTP send/verify, JWT issue for mobile sign-in.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Module } from '@nestjs/common';
import { LoggerModule } from '@api/shared/logger';
import { UserModule } from '@api/modules/user/user.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { OtpStoreService } from './services/otp-store.service';
import { SmsService } from './services/sms.service';
import { MetricsModule } from '@api/modules/metrics/metrics.module';

@Module({
  imports: [LoggerModule, UserModule, MetricsModule],
  providers: [SmsService, OtpStoreService, OtpService, AuthService, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
