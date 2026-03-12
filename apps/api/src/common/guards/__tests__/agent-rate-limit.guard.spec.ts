/**
 * @file agent-rate-limit.guard.spec.ts
 * @module common/guards
 * @description Unit tests for AgentRateLimitGuard (per-IP rate limit).
 * @author BharatERP
 * @created 2025-03-12
 */

import { HttpStatus } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AgentRateLimitGuard } from '../agent-rate-limit.guard';
import { ConfigService } from '@nestjs/config';

function mockContext(ip: string): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({ ip, socket: { remoteAddress: ip } }),
    }),
  } as unknown as ExecutionContext;
}

describe('AgentRateLimitGuard', () => {
  let guard: AgentRateLimitGuard;
  let config: { get: jest.Mock };

  beforeEach(() => {
    config = { get: jest.fn().mockReturnValue(2) };
    guard = new AgentRateLimitGuard(config as unknown as ConfigService);
  });

  it('should allow requests under the limit', () => {
    const ctx = mockContext('192.168.1.1');
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw TOO_MANY_REQUESTS when over limit', () => {
    const ctx = mockContext('10.0.0.1');
    guard.canActivate(ctx);
    guard.canActivate(ctx);
    expect(() => guard.canActivate(ctx)).toThrow('Agent rate limit exceeded');
    try {
      guard.canActivate(ctx);
    } catch (e: unknown) {
      const err = e as { statusCode?: number; getStatus?: () => number };
      const status = err.statusCode ?? err.getStatus?.();
      expect(status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('should use AGENT_RATE_LIMIT_PER_MIN from config', () => {
    config.get.mockReturnValue(1);
    const guard2 = new AgentRateLimitGuard(config as unknown as ConfigService);
    const ctx = mockContext('172.16.0.1');
    expect(guard2.canActivate(ctx)).toBe(true);
    expect(() => guard2.canActivate(ctx)).toThrow('Agent rate limit exceeded');
  });
});
