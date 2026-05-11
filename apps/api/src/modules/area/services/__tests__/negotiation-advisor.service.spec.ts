/**
 * File:        apps/api/src/modules/area/services/__tests__/negotiation-advisor.service.spec.ts
 * Module:      Area · Negotiation Advisor (test)
 * Purpose:     Verify NegotiationAdvisorService bounds offers to [85%, 100%]
 *              of ask, falls back deterministically when LLM is unavailable,
 *              and gracefully emits a "not found" payload via notFound().
 *
 * Exports:     none (Jest test file)
 *
 * Depends on:
 *   - jest, @nestjs/testing
 *
 * Side-effects: none.
 *
 * Key invariants:
 *   - Suggested offer is never above ask, never below ask × 0.85.
 *   - Margin is recomputed from the (possibly clamped) offer, not echoed
 *     blindly from the LLM.
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { AreaService } from '../area.service';
import { PriceForecastService } from '../price-forecast.service';
import {
  NegotiationAdvisorInput,
  NegotiationAdvisorService,
} from '../negotiation-advisor.service';

jest.mock('@api/shared/llm/create-agent-chat-model', () => ({
  tryCreateAgentChatModel: jest.fn(),
}));
jest.mock('@api/shared/llm/llm-token-usage', () => ({
  parseLlmUsageFromLlmMessage: jest.fn(() => null),
  buildLlmUsageLogFields: jest.fn(() => ({})),
}));

import { tryCreateAgentChatModel } from '@api/shared/llm/create-agent-chat-model';

const ASK = 10_000_000;

const exampleInput: NegotiationAdvisorInput = {
  propertyId: 'uuid-1',
  title: 'Test Apartment',
  location: 'Koramangala, Bangalore',
  price: ASK,
  bedrooms: 3,
  areaSqft: 1500,
};

describe('NegotiationAdvisorService', () => {
  let service: NegotiationAdvisorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegotiationAdvisorService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: LoggerService,
          useValue: { info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
        { provide: MetricsService, useValue: { recordLlmTokens: jest.fn() } },
        {
          provide: AreaService,
          useValue: {
            getOrCreate: jest
              .fn()
              .mockResolvedValue({ priceTrendPctAnnual: 8, livabilityScore: 80 }),
          },
        },
        {
          provide: PriceForecastService,
          useValue: {
            getForecast: jest
              .fn()
              .mockResolvedValue({ demandSignal: 'medium', forecast12m: 8 }),
          },
        },
      ],
    }).compile();
    service = module.get(NegotiationAdvisorService);
  });

  it('returns deterministic baseline when no LLM provider is configured', async () => {
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue(null);

    const result = await service.advise(exampleInput);
    expect(result.found).toBe(true);
    expect(result.source).toBe('baseline');
    expect(result.suggestedOfferInr).toBeLessThan(ASK);
    expect(result.suggestedOfferInr).toBeGreaterThanOrEqual(ASK * 0.85);
  });

  it('clamps offer when LLM suggests below 85% of ask', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          suggestedOfferInr: ASK * 0.5, // way too low
          marginPctBelowAsk: 50,
          strategy: 'Aggressive offer.',
          signals: [],
          walkAwayIf: [],
          confidence: 'high',
        }),
      }),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.advise(exampleInput);
    expect(result.suggestedOfferInr).toBeGreaterThanOrEqual(ASK * 0.85);
    expect(result.suggestedOfferInr).toBeLessThanOrEqual(ASK);
    // Margin recomputed from clamped offer:
    expect(result.marginPctBelowAsk).toBeLessThanOrEqual(15);
  });

  it('clamps offer when LLM suggests above ask', async () => {
    const fakeLlm = {
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          suggestedOfferInr: ASK * 1.2,
          marginPctBelowAsk: -20,
          strategy: 'Pay more!',
          signals: [],
          walkAwayIf: [],
          confidence: 'low',
        }),
      }),
    };
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue({ llm: fakeLlm, provider: 'google' });

    const result = await service.advise(exampleInput);
    expect(result.suggestedOfferInr).toBeLessThanOrEqual(ASK);
    expect(result.marginPctBelowAsk ?? 0).toBeGreaterThanOrEqual(0);
  });

  it('notFound() emits a non-throwing "not found" payload', () => {
    const result = service.notFound('missing-id');
    expect(result.found).toBe(false);
    expect(result.source).toBe('not_found');
    expect(result.strategy.toLowerCase()).toContain('missing-id');
  });

  it('formatForAgent returns a one-block string with offer and ask', async () => {
    (tryCreateAgentChatModel as jest.Mock).mockReturnValue(null);
    const result = await service.advise(exampleInput);
    const formatted = service.formatForAgent(result, 'Test Apartment');
    expect(formatted).toContain('Test Apartment');
    expect(formatted).toContain('Suggested offer');
    expect(formatted).toContain('Ask');
  });
});
