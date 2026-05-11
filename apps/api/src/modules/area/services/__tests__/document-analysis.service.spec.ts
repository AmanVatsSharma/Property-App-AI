/**
 * File:        apps/api/src/modules/area/services/__tests__/document-analysis.service.spec.ts
 * Module:      Area · Document Analysis (test)
 * Purpose:     Verify DocumentAnalysisService returns a deterministic fallback
 *              when LLM is unavailable, parses red/yellow/green flags from
 *              well-formed JSON, and never throws on bad LLM output.
 *
 * Exports:     none (Jest test file)
 *
 * Depends on:
 *   - jest, @nestjs/testing
 *
 * Side-effects: none.
 *
 * Key invariants:
 *   - Output disclaimer must always be present.
 *   - flags array is bounded, level is one of green/yellow/red.
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { DocumentAnalysisService } from '../document-analysis.service';

jest.mock('@api/shared/llm/create-agent-chat-model', () => ({
  tryCreateAgentChatModel: jest.fn(),
}));
jest.mock('@api/shared/llm/llm-token-usage', () => ({
  parseLlmUsageFromLlmMessage: jest.fn(() => null),
  buildLlmUsageLogFields: jest.fn(() => ({})),
}));

import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';

describe('DocumentAnalysisService', () => {
  let service: DocumentAnalysisService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentAnalysisService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
        { provide: MetricsService, useValue: { recordLlmTokens: jest.fn() } },
      ],
    }).compile();
    service = module.get(DocumentAnalysisService);
  });

  it('returns fallback with disclaimer when no LLM provider is configured', async () => {
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue(null);

    const result = await service.analyze('Sale deed text...');
    expect(result.documentType).toBe('Unknown');
    expect(result.overallRisk).toBe('yellow');
    expect(result.disclaimer).toMatch(/lawyer/i);
    expect(result.flags.length).toBeGreaterThan(0);
  });

  it('handles empty input with a "no input" yellow flag', async () => {
    const result = await service.analyze('   ');
    expect(result.flags[0].level).toBe('yellow');
    expect(result.summary.toLowerCase()).toContain('no document');
  });

  it('parses LLM JSON and clamps flags to green/yellow/red', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          documentType: 'Sale Deed',
          overallRisk: 'red',
          summary: 'Title chain not clear.',
          flags: [
            {
              level: 'red',
              category: 'Title chain',
              finding: 'Missing 12-year title trail.',
              recommendation: 'Insist on title trail before payment.',
            },
            {
              level: 'banana', // invalid → coerced to yellow
              category: 'Stamp duty',
              finding: 'Stamp paper undervalued.',
              recommendation: 'Recompute stamp duty.',
            },
          ],
          positives: ['Seller signature present'],
          recommendedActions: ['Hire lawyer'],
          confidence: 'high',
        }),
      }),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.analyze('Sale deed text...');
    expect(result.documentType).toBe('Sale Deed');
    expect(result.overallRisk).toBe('red');
    expect(result.flags.length).toBe(2);
    expect(result.flags[1].level).toBe('yellow');
    expect(result.positives).toContain('Seller signature present');
  });

  it('falls back gracefully when LLM rejects', async () => {
    const fakeLlm = { invoke: jest.fn().mockRejectedValue(new Error('boom')) };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.analyze('text');
    expect(result.overallRisk).toBe('yellow');
    expect(result.disclaimer).toMatch(/lawyer/i);
  });
});
