/**
 * @file auth.service.spec.ts
 * @module auth
 * @description Unit tests for AuthService: OTP verify, role assignment (admin/broker from allowlists).
 * @author BharatERP
 * @created 2025-03-13
 */

import { AuthService } from '../auth.service';
import { OtpService } from '../otp.service';
import { UserService } from '../../../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../shared/logger';
import { UserRole } from '../../../../user/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let otpService: { verify: jest.Mock; validatePhone: jest.Mock };
  let userService: { getOrCreateByPhone: jest.Mock; setRole: jest.Mock };
  let config: { get: jest.Mock };
  let jwt: { signAsync: jest.Mock };

  const mockUser = {
    id: 'user-uuid',
    phone: '9876543210',
    displayName: null,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    otpService = { verify: jest.fn().mockReturnValue(true), validatePhone: jest.fn().mockReturnValue(true) };
    userService = {
      getOrCreateByPhone: jest.fn().mockResolvedValue(mockUser),
      setRole: jest.fn().mockImplementation((_id, role) => Promise.resolve({ ...mockUser, role })),
    };
    config = { get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret-min-16-chars';
      if (key === 'JWT_EXPIRES_IN') return '7d';
      if (key === 'ADMIN_PHONES') return '';
      if (key === 'BROKER_PHONES') return '';
      return undefined;
    }) };
    jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') };
    authService = new AuthService(
      otpService as unknown as OtpService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
      userService as unknown as UserService,
      {} as LoggerService,
    );
  });

  describe('verifyOtp', () => {
    it('should set broker role when phone is in BROKER_PHONES and not in ADMIN_PHONES', async () => {
      config.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_PHONES') return '';
        if (key === 'BROKER_PHONES') return '9876543210';
        if (key === 'JWT_SECRET') return 'test-secret-min-16-chars';
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return undefined;
      });
      const result = await authService.verifyOtp('9876543210', '123456');
      expect(userService.setRole).toHaveBeenCalledWith('user-uuid', UserRole.BROKER);
      expect(result.user.role).toBe(UserRole.BROKER);
    });

    it('should set admin role when phone is in ADMIN_PHONES (admin takes precedence over broker)', async () => {
      config.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_PHONES') return '9876543210';
        if (key === 'BROKER_PHONES') return '9876543210';
        if (key === 'JWT_SECRET') return 'test-secret-min-16-chars';
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return undefined;
      });
      userService.setRole.mockResolvedValue({ ...mockUser, role: UserRole.ADMIN });
      const result = await authService.verifyOtp('9876543210', '123456');
      expect(userService.setRole).toHaveBeenCalledTimes(1);
      expect(userService.setRole).toHaveBeenCalledWith('user-uuid', UserRole.ADMIN);
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should not call setRole when phone is in neither allowlist', async () => {
      config.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_PHONES') return '';
        if (key === 'BROKER_PHONES') return '';
        if (key === 'JWT_SECRET') return 'test-secret-min-16-chars';
        if (key === 'JWT_EXPIRES_IN') return '7d';
        return undefined;
      });
      const result = await authService.verifyOtp('9876543210', '123456');
      expect(userService.setRole).not.toHaveBeenCalled();
      expect(result.user.role).toBe(UserRole.USER);
    });
  });
});
