/**
 * @file sms.service.spec.ts
 * @module auth
 * @description Unit tests for SmsService — Zavu, MSG91 (sendotp.php via fetch), stub paths.
 * @author BharatERP
 * @created 2026-03-28
 * @updated 2026-03-28
 */

const mockSend = jest.fn();

jest.mock('@zavudev/sdk', () => {
  class MockAPIError extends Error {
    readonly status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'APIError';
      this.status = status;
    }
  }
  const APIError = MockAPIError;
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { send: mockSend },
    })),
    APIError,
  };
});

import { APIError } from '@zavudev/sdk';
import { SmsService } from '../sms.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';

describe('SmsService', () => {
  let logger: { debug: jest.Mock; warn: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ message: { id: 'msg_1' } });
    logger = { debug: jest.fn(), warn: jest.fn(), log: jest.fn(), error: jest.fn() };
  });

  function makeService(overrides: Record<string, string | undefined> = {}): SmsService {
    const defaults: Record<string, string | undefined> = {
      SMS_PROVIDER: 'zavu',
      ZAVUDEV_API_KEY: 'zv_test_key',
      ZAVUDEV_SENDER: undefined,
      TWILIO_ACCOUNT_SID: undefined,
      TWILIO_AUTH_TOKEN: undefined,
      TWILIO_FROM: undefined,
      MSG91_AUTH_KEY: undefined,
      MSG91_SENDER: 'SMSIND',
    };
    const map = { ...defaults, ...overrides };
    const config = {
      get: jest.fn((key: string) => map[key]),
    };
    return new SmsService(config as unknown as ConfigService, logger as unknown as LoggerService);
  }

  it('sends OTP SMS via Zavu with E.164, sms channel, and idempotency key', async () => {
    const svc = makeService({
      ZAVUDEV_SENDER: 'snd_profile',
    });
    await svc.send(
      '9876543210',
      'Your UrbanNest.ai verification code is 123456. Valid for 5 minutes.',
      '123456',
    );
    expect(mockSend).toHaveBeenCalledWith({
      to: '+919876543210',
      channel: 'sms',
      text: 'Your UrbanNest.ai verification code is 123456. Valid for 5 minutes.',
      idempotencyKey: 'otp-9876543210-123456',
      'Zavu-Sender': 'snd_profile',
    });
  });

  it('omits Zavu-Sender when ZAVUDEV_SENDER is unset', async () => {
    const svc = makeService({});
    await svc.send('9876543210', 'code 555555', '555555');
    expect(mockSend).toHaveBeenCalledWith({
      to: '+919876543210',
      channel: 'sms',
      text: 'code 555555',
      idempotencyKey: 'otp-9876543210-555555',
    });
  });

  it('uses stub path when zavu is selected but ZAVUDEV_API_KEY is empty', async () => {
    const svc = makeService({ ZAVUDEV_API_KEY: '' });
    await svc.send('9876543210', 'Your code is 111111');
    expect(mockSend).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      'SMS (stub): OTP not sent — set SMS_PROVIDER and provider credentials for production',
      expect.objectContaining({ phone: '9876543210' }),
    );
  });

  it('warns and throws when Zavu returns APIError', async () => {
    mockSend.mockRejectedValue(new APIError(422, 'unprocessable'));
    const svc = makeService({});
    await expect(svc.send('9876543210', 'code 999999', '999999')).rejects.toThrow('Zavu SMS failed: 422');
    expect(logger.warn).toHaveBeenCalledWith(
      'Zavu SMS failed',
      expect.objectContaining({ status: 422, phone: '3210', detail: 'unprocessable' }),
    );
  });

  describe('MSG91 provider (sendotp.php)', () => {
    const previousFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ type: 'success' }),
      }) as unknown as typeof fetch;
    });

    afterEach(() => {
      global.fetch = previousFetch;
    });

    function makeMsg91Service(overrides: Record<string, string | undefined> = {}): SmsService {
      return makeService({
        SMS_PROVIDER: 'msg91',
        MSG91_AUTH_KEY: 'msg91_test_auth',
        MSG91_SENDER: 'SMSIND',
        ZAVUDEV_API_KEY: undefined,
        ...overrides,
      });
    }

    it('GETs sendotp.php with mobile, sender, message, and otp from otpCode', async () => {
      const svc = makeMsg91Service({});
      const msg = 'Your UrbanNest.ai verification code is 654321. Valid for 5 minutes.';
      await svc.send('9876543210', msg, '654321');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const url = String((global.fetch as jest.Mock).mock.calls[0][0]);
      expect(url).toContain('https://api.msg91.com/api/sendotp.php');
      expect(url).toContain('mobile=919876543210');
      expect(url).toContain('sender=SMSIND');
      expect(url).toContain(encodeURIComponent('654321'));
      expect(url).toContain(encodeURIComponent(msg));
      expect(logger.debug).toHaveBeenCalledWith('MSG91 OTP sent', expect.objectContaining({ mobile: '3210' }));
    });

    it('throws when MSG91 response is not success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ type: 'error' }),
      }) as unknown as typeof fetch;
      const svc = makeMsg91Service({});
      await expect(
        svc.send('9876543210', 'Your code is 111222. Valid for 5 minutes.', '111222'),
      ).rejects.toThrow('MSG91 OTP failed');
      expect(logger.warn).toHaveBeenCalledWith('MSG91 OTP failed', expect.any(Object));
    });

    it('throws when HTTP not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => 'fail',
      }) as unknown as typeof fetch;
      const svc = makeMsg91Service({});
      await expect(svc.send('9876543210', 'x', '333444')).rejects.toThrow('MSG91 OTP failed: 503');
    });
  });
});
