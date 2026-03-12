/**
 * @file auth.service.ts
 * @module auth
 * @description Send OTP, verify OTP, issue JWT; get-or-create User by phone; set admin/broker from ADMIN_PHONES/BROKER_PHONES.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { UserService } from '../../user/services/user.service';
import { LoggerService } from '../../../shared/logger';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly otp: OtpService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    if (!this.otp.validatePhone(phone)) {
      throw new BadRequestException('Invalid Indian mobile number (10 digits, starting 6-9)');
    }
    const code = this.otp.generateCode();
    const normalized = phone.replace(/\D/g, '').slice(-10);
    this.otp.set(normalized, code);
    await this.otp.sendOtpToProvider(normalized, code);
    this.logger.debug('sendOtp', { phone: normalized });
    return { success: true, message: 'OTP sent' };
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: { id: string; phone: string; displayName: string | null; role: UserRole } }> {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    if (!this.otp.verify(normalized, code)) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    let user = await this.userService.getOrCreateByPhone(normalized);
    const adminPhonesRaw = this.config.get<string>('ADMIN_PHONES') ?? '';
    const adminPhones = adminPhonesRaw.split(',').map((p) => p.replace(/\D/g, '').trim()).filter(Boolean);
    const brokerPhonesRaw = this.config.get<string>('BROKER_PHONES') ?? '';
    const brokerPhones = brokerPhonesRaw.split(',').map((p) => p.replace(/\D/g, '').trim()).filter(Boolean);
    if (adminPhones.includes(normalized)) {
      user = await this.userService.setRole(user.id, UserRole.ADMIN);
    } else if (brokerPhones.includes(normalized)) {
      user = await this.userService.setRole(user.id, UserRole.BROKER);
    }
    const secret = this.config.get<string>('JWT_SECRET') ?? 'default-secret-min-16-chars';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '7d';
    const token = await this.jwt.signAsync(
      { sub: user.id, phone: user.phone, role: user.role },
      { secret, expiresIn },
    );
    this.logger.debug('verifyOtp', { userId: user.id, phone: normalized, role: user.role });
    return {
      token,
      user: { id: user.id, phone: user.phone, displayName: user.displayName, role: user.role },
    };
  }
}
