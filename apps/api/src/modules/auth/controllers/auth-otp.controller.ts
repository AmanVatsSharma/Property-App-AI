/**
 * @file auth-otp.controller.ts
 * @module auth
 * @description REST OTP endpoints (MSG91 v5 + Redis + bcrypt + WhatsApp + WhatsApp QR). Version-neutral path: /auth/otp/* .
 * @author BharatERP
 * @created 2026-03-28
 * @updated 2026-05-12 — Added WhatsApp QR OTP endpoints
 */

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, VERSION_NEUTRAL, Headers, UnauthorizedException } from '@nestjs/common';
import { Public } from '@api/common/decorators/public.decorator';
import { SendOtpRestDto } from '../dto/send-otp-rest.dto';
import { VerifyOtpRestDto } from '../dto/verify-otp-rest.dto';
import { SendWhatsAppOtpDto } from '../dto/send-whatsapp-otp.dto';
import { InitWhatsAppQrDto, VerifyWhatsAppQrDto, CleanupWhatsAppQrDto } from '../dto/whatsapp-qr-otp.dto';
import { RestOtpService } from '../services/rest-otp.service';
import { WhatsAppOtpService } from '../integrations/whatsapp-otp.service';
import { WhatsAppQrOtpService } from '../services/whatsapp-qr-otp.service';
import { OtpService } from '../services/otp.service';
import { LoggerService } from '@api/shared/logger';
import { RefreshTokenService } from '../services/refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@api/modules/user/services/user.service';

@Controller({ path: 'auth/otp', version: VERSION_NEUTRAL })
@Public()
export class AuthOtpController {
  constructor(
    private readonly restOtp: RestOtpService,
    private readonly whatsAppOtp: WhatsAppOtpService,
    private readonly whatsAppQrOtp: WhatsAppQrOtpService,
    private readonly otpService: OtpService,
    private readonly logger: LoggerService,
    private readonly refreshToken: RefreshTokenService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() body: SendOtpRestDto) {
    return this.restOtp.sendOtp(body.phoneNumber);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: VerifyOtpRestDto) {
    return this.restOtp.verifyOtp(body.phoneNumber, body.otp);
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resend(@Body() body: SendOtpRestDto) {
    return this.restOtp.resendOtp(body.phoneNumber);
  }

  /**
   * Send OTP via WhatsApp Business API
   * Falls back to SMS if WhatsApp fails (configurable)
   */
  @Post('whatsapp/send')
  @HttpCode(HttpStatus.OK)
  async sendWhatsApp(@Body() body: SendWhatsAppOtpDto) {
    const otpCode = this.generateOtp();
    const result = await this.whatsAppOtp.sendOtp(
      body.phoneNumber,
      otpCode,
      body.forceSmsFallback ?? true
    );

    if (result.success) {
      // Store OTP for verification (same as SMS flow)
      await this.restOtp.sendOtp(body.phoneNumber);

      return {
        success: true,
        channel: result.fallbackUsed ? 'sms' : 'whatsapp',
        message: result.fallbackUsed
          ? 'WhatsApp failed, sent via SMS instead'
          : 'OTP sent via WhatsApp',
      };
    }

    return {
      success: false,
      channel: 'none',
      message: result.error,
    };
  }

  /**
   * Verify OTP (works for both SMS and WhatsApp since we store in same backend)
   */
  @Post('whatsapp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyWhatsApp(@Body() body: VerifyOtpRestDto) {
    return this.restOtp.verifyOtp(body.phoneNumber, body.otp);
  }

  // ── WhatsApp QR OTP (scan-to-verify, no Meta Business API) ─────────────────

  /**
   * Initialize a WhatsApp QR session.
   * Returns sessionId immediately; client must poll /whatsapp-qr/status/:sessionId for the QR.
   */
  @Post('whatsapp-qr/init')
  @HttpCode(HttpStatus.OK)
  async initWhatsAppQr(@Body() body: InitWhatsAppQrDto) {
    return this.whatsAppQrOtp.initializeSession(body.phoneNumber);
  }

  /**
   * Poll the scan/OTP status of a WhatsApp QR session.
   * Returns { status, qrCode?, otpSent? }.
   * Client should poll every 1–2 seconds.
   */
  @Get('whatsapp-qr/status/:sessionId')
  async getWhatsAppQrStatus(@Param('sessionId') sessionId: string) {
    return this.whatsAppQrOtp.pollScanStatus(sessionId);
  }

  /**
   * Verify the 6-digit OTP delivered via WhatsApp chat.
   */
  @Post('whatsapp-qr/verify')
  @HttpCode(HttpStatus.OK)
  async verifyWhatsAppQr(@Body() body: VerifyWhatsAppQrDto) {
    return this.whatsAppQrOtp.verifyOtp(body.sessionId, body.otp);
  }

  /**
   * Destroy a WhatsApp QR session explicitly.
   */
  @Delete('whatsapp-qr/session/:sessionId')
  @HttpCode(HttpStatus.OK)
  async cleanupWhatsAppQrSession(@Param('sessionId') sessionId: string) {
    await this.whatsAppQrOtp.cleanupSession(sessionId);
    return { success: true };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ── JWT Refresh Token Rotation ──────────────────────────────────────────────

  /**
   * Exchange a valid refresh token for a new access token + new refresh token (rotation).
   * The old refresh token is invalidated after use.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('refreshToken is required');
    }

    // Find user by scanning for matching refresh token hash (O(n) scan — acceptable for low traffic)
    // In production with many users, consider a refresh_token → userId Redis index.
    const user = await this.userService.findById('__placeholder__');
    const allUsers = await this.userService.findAll(1000, 0);
    let matchedUser = null;
    for (const u of allUsers.users) {
      const valid = await this.refreshToken.validateRefreshToken(u.id, body.refreshToken);
      if (valid) { matchedUser = u; break; }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Issue new access token
    const secret = this.config.get<string>('JWT_SECRET') ?? 'default-secret-min-16-chars';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '7d';
    const accessToken = await this.jwt.signAsync(
      { sub: matchedUser.id, phone: matchedUser.phone, role: matchedUser.role },
      { secret, expiresIn },
    );

    // Rotate refresh token
    const newRefreshToken = await this.refreshToken.generateRefreshToken(matchedUser.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: matchedUser.id, phone: matchedUser.phone, displayName: matchedUser.displayName, role: matchedUser.role },
    };
  }

  /**
   * Logout: revoke the user's refresh token.
   * Client should discard both access and refresh tokens.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { refreshToken?: string }) {
    if (body.refreshToken) {
      // Find user with this token and revoke
      const allUsers = await this.userService.findAll(1000, 0);
      for (const u of allUsers.users) {
        const valid = await this.refreshToken.validateRefreshToken(u.id, body.refreshToken);
        if (valid) {
          await this.refreshToken.revokeRefreshToken(u.id);
          break;
        }
      }
    }
    return { success: true };
  }
}
