/**
 * File:        apps/api/src/modules/area/services/__tests__/rera-check.service.spec.ts
 * Module:      Area · RERA Check (test)
 * Purpose:     Verify ReraCheckService returns a deterministic fallback when
 *              no AI provider is configured, parses well-formed LLM JSON,
 *              and degrades gracefully on parse / call failure.
 *
 * Exports:     none (Jest test file)
 *
 * Depends on:
 *   - jest, @nestjs/testing
 *
 * Side-effects: none (pure unit tests; mocks the LLM factory module).
 *
 * Key invariants:
 *   - Service must NEVER throw (always return a ReraCheckResult).
 *   - Empty query is a special-cased nudge.
 *
 * Read order:
 *   1. mock setup (LLM factory)
 *   2. fallback test
 *   3. happy-path JSON parse test
 *   4. failure-path test
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { ReraCheckService } from '../rera-check.service';

jest.mock('@api/shared/llm/create-agent-chat-model', () => ({
  tryCreateAgentChatModel: jest.fn(),
}));
jest.mock('@api/shared/llm/llm-token-usage', () => ({
  parseLlmUsageFromLlmMessage: jest.fn(() => null),
  buildLlmUsageLogFields: jest.fn(() => ({})),
}));

import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';

describe('ReraCheckService', () => {
  let service: ReraCheckService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReraCheckService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
        { provide: MetricsService, useValue: { recordLlmTokens: jest.fn() } },
      ],
    }).compile();
    service = module.get(ReraCheckService);
  });

  it('returns deterministic fallback when no LLM provider is configured', async () => {
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue(null);

    const result = await service.check('Lodha Park, Mumbai');

    expect(result.status).toBe('unknown');
    expect(result.confidence).toBe('low');
    expect(result.portalUrl).toMatch(/^https:\/\//);
    expect(result.query).toBe('Lodha Park, Mumbai');
  });

  it('returns "empty query" nudge when input is blank', async () => {
    const result = await service.check('   ');
    expect(result.status).toBe('unknown');
    expect(result.rationale.toLowerCase()).toContain('empty');
  });

  it('parses well-formed LLM JSON and maps state to portal URL', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          projectName: 'Lodha Park',
          builderName: 'Lodha Group',
          state: 'maharashtra',
          status: 'registered',
          rationale: 'Project commonly listed on MahaRERA.',
          nextStep: 'Verify on MahaRERA.',
          confidence: 'medium',
        }),
      }),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.check('Lodha Park, Mumbai');

    expect(result.status).toBe('registered');
    expect(result.projectName).toBe('Lodha Park');
    expect(result.state).toBe('maharashtra');
    expect(result.portalUrl).toContain('maharera.maharashtra.gov.in');
    expect(result.confidence).toBe('medium');
  });

  it('falls back when LLM returns non-JSON text', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockResolvedValue({ content: 'no json here' }),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.check('Random Project');
    expect(result.status).toBe('unknown');
    expect(result.confidence).toBe('low');
  });

  it('does not throw when LLM call rejects', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockRejectedValue(new Error('boom')),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.check('Anything');
    expect(result.status).toBe('unknown');
  });

  it('formatForAgent renders a one-paragraph summary including portal URL', () => {
    const summary = service.formatForAgent({
      query: 'Lodha Park, Mumbai',
      status: 'registered',
      projectName: 'Lodha Park',
      builderName: 'Lodha Group',
      state: 'maharashtra',
      rationale: 'Listed on MahaRERA.',
      portalUrl: 'https://maharera.maharashtra.gov.in',
      nextStep: 'Verify online.',
      confidence: 'medium',
      lastChecked: new Date().toISOString(),
    });
    expect(summary).toContain('Lodha Park');
    expect(summary).toContain('maharera');
    expect(summary).toContain('Verify online');
  });
});
