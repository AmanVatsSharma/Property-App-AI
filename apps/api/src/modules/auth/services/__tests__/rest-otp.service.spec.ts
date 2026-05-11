/**
 * @file rest-otp.service.spec.ts
 * @module auth
 * @description Unit tests for RestOtpService verify path (bcrypt + attempt limits).
 * @author BharatERP
 * @created 2026-03-28
 */

import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RestOtpService } from '../rest-otp.service';
import { AuthService } from '../auth.service';
import { OtpService } from '../otp.service';
import { OtpSessionRedisRepository } from '../otp-session-redis.repository';
import { Msg91OtpV5Service } from '../../integrations/msg91-otp-v5.service';
import { LoggerService } from '@api/shared/logger';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@api/modules/user/entities/user.entity';

describe('RestOtpService', () => {
  let restOtp: RestOtpService;
  let sessionRepo: {
    isAvailable: jest.Mock;
    getSession: jest.Mock;
    getVerifyFailures: jest.Mock;
    incrementVerifyFailures: jest.Mock;
    clearVerifyFailures: jest.Mock;
    deleteSession: jest.Mock;
    clearResendCooldown: jest.Mock;
  };
  let auth: { finalizeMobileLogin: jest.Mock };
  let otpSvc: { validatePhone: jest.Mock };

  beforeEach(() => {
    sessionRepo = {
      isAvailable: jest.fn().mockReturnValue(true),
      getSession: jest.fn(),
      getVerifyFailures: jest.fn().mockResolvedValue(0),
      incrementVerifyFailures: jest.fn().mockResolvedValue(1),
      clearVerifyFailures: jest.fn(),
      deleteSession: jest.fn(),
      clearResendCooldown: jest.fn(),
    };
    auth = {
      finalizeMobileLogin: jest.fn().mockResolvedValue({
        token: 'jwt',
        user: { id: 'u1', phone: '9876543210', displayName: null, role: UserRole.USER },
      }),
    };
    otpSvc = { validatePhone: jest.fn().mockReturnValue(true) };
    const config = {
      get: jest.fn((k: string) => {
        if (k === 'REST_OTP_MSG91_ENABLED') return true;
        if (k === 'MSG91_TEMPLATE_ID') return 'tpl_test';
        if (k === 'OTP_REST_TTL_SEC') return 300;
        if (k === 'OTP_REST_MAX_VERIFY_ATTEMPTS') return 3;
        return undefined;
      }),
    };
    const logger = { debug: jest.fn(), warn: jest.fn(), log: jest.fn(), error: jest.fn() };
    const msg91 = { sendOtp: jest.fn() };
    restOtp = new RestOtpService(
      config as unknown as ConfigService,
      logger as unknown as LoggerService,
      auth as unknown as AuthService,
      otpSvc as unknown as OtpService,
      sessionRepo as unknown as OtpSessionRedisRepository,
      msg91 as unknown as Msg91OtpV5Service,
    );
  });

  it('verify succeeds and clears session when bcrypt matches', async () => {
    const otp = '654321';
    const hash = await bcrypt.hash(otp, 4);
    sessionRepo.getSession.mockResolvedValue({ hash, requestId: 'rid1' });
    const result = await restOtp.verifyOtp('9876543210', otp);
    expect(result.accessToken).toBe('jwt');
    expect(sessionRepo.deleteSession).toHaveBeenCalledWith('9876543210');
    expect(auth.finalizeMobileLogin).toHaveBeenCalledWith('9876543210');
  });

  it('verify increments failures on wrong otp', async () => {
    const hash = await bcrypt.hash('111111', 4);
    sessionRepo.getSession.mockResolvedValue({ hash, requestId: null });
    await expect(restOtp.verifyOtp('9876543210', '999999')).rejects.toBeInstanceOf(BadRequestException);
    expect(sessionRepo.incrementVerifyFailures).toHaveBeenCalled();
    expect(auth.finalizeMobileLogin).not.toHaveBeenCalled();
  });
});
