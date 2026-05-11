/**
 * @file auth.module.ts
 * @module auth
 * @description Auth module: OTP send/verify (GraphQL + REST MSG91 v5 + WhatsApp + WhatsApp QR Web), JWT issue for mobile sign-in.
 * @author BharatERP
 * @created 2025-03-12
 * @updated 2026-05-12 — Added WhatsApp QR OTP service
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
import { Msg91OtpV5Service } from './integrations/msg91-otp-v5.service';
import { OtpSessionRedisRepository } from './services/otp-session-redis.repository';
import { RestOtpService } from './services/rest-otp.service';
import { WhatsAppQrOtpService } from './services/whatsapp-qr-otp.service';
import { AuthOtpController } from './controllers/auth-otp.controller';
import { DevLoginController } from './controllers/dev-login.controller';
import { WhatsAppOtpService } from './integrations/whatsapp-otp.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [LoggerModule, UserModule, MetricsModule],
  controllers: [AuthOtpController, DevLoginController],
  providers: [
    SmsService,
    OtpStoreService,
    OtpService,
    AuthService,
    AuthResolver,
    Msg91OtpV5Service,
    OtpSessionRedisRepository,
    RestOtpService,
    WhatsAppQrOtpService,
    WhatsAppOtpService,
    RefreshTokenService,
  ],
  exports: [AuthService, WhatsAppOtpService, WhatsAppQrOtpService, RefreshTokenService],
})
export class AuthModule {}
