/**
 * @file agent-rate-limit.guard.spec.ts
 * @module common/guards
 * @description Unit tests for AgentRateLimitGuard (per-IP rate limit).
 * @author BharatERP
 * @created 2025-03-12
 */

import { HttpStatus } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AgentRateLimitGuard } from '@api/common/guards/agent-rate-limit.guard';
import { ConfigService } from '@nestjs/config';
import { AgentRateLimitStore } from '@api/common/guards/agent-rate-limit.store';

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
  let store: { incrementAndCheck: jest.Mock };

  beforeEach(() => {
    config = { get: jest.fn().mockReturnValue(2) };
    store = { incrementAndCheck: jest.fn().mockResolvedValue(true) };
    guard = new AgentRateLimitGuard(
      config as unknown as ConfigService,
      store as unknown as AgentRateLimitStore,
    );
  });

  it('should allow requests under the limit', async () => {
    const ctx = mockContext('192.168.1.1');
    store.incrementAndCheck.mockResolvedValue(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('should throw TOO_MANY_REQUESTS when over limit', async () => {
    const ctx = mockContext('10.0.0.1');
    store.incrementAndCheck.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await guard.canActivate(ctx);
    await guard.canActivate(ctx);
    await expect(guard.canActivate(ctx)).rejects.toThrow('Agent rate limit exceeded');
    try {
      await guard.canActivate(ctx);
    } catch (e: unknown) {
      const err = e as { statusCode?: number; getStatus?: () => number };
      const status = err.statusCode ?? err.getStatus?.();
      expect(status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('should use AGENT_RATE_LIMIT_PER_MIN from config', async () => {
    config.get.mockReturnValue(1);
    const store2 = { incrementAndCheck: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false) };
    const guard2 = new AgentRateLimitGuard(
      config as unknown as ConfigService,
      store2 as unknown as AgentRateLimitStore,
    );
    const ctx = mockContext('172.16.0.1');
    await expect(guard2.canActivate(ctx)).resolves.toBe(true);
    await expect(guard2.canActivate(ctx)).rejects.toThrow('Agent rate limit exceeded');
  });
});
