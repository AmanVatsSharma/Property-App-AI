/**
 * @file llm-token-usage.spec.ts
 * @module shared/llm
 * @description Unit tests for LLM usage parsing and Sonnet 4 cost estimate helper.
 * @author BharatERP
 * @created 2026-03-20
 */

import {
  addLlmUsage,
  estimateUsdAnthropicSonnet4Base,
  parseLlmUsageFromLlmMessage,
} from './llm-token-usage';

describe('parseLlmUsageFromLlmMessage', () => {
  it('returns null for non-objects', () => {
    expect(parseLlmUsageFromLlmMessage(null)).toBeNull();
    expect(parseLlmUsageFromLlmMessage(undefined)).toBeNull();
    expect(parseLlmUsageFromLlmMessage('x')).toBeNull();
  });

  it('reads LangChain usage_metadata (Anthropic-style)', () => {
    expect(
      parseLlmUsageFromLlmMessage({
        usage_metadata: { input_tokens: 100, output_tokens: 40 },
      }),
    ).toEqual({ inputTokens: 100, outputTokens: 40 });
  });

  it('reads OpenAI-style response_metadata.usage', () => {
    expect(
      parseLlmUsageFromLlmMessage({
        response_metadata: { usage: { prompt_tokens: 50, completion_tokens: 20 } },
      }),
    ).toEqual({ inputTokens: 50, outputTokens: 20 });
  });

  it('reads input_tokens / output_tokens on response_metadata.usage as fallback', () => {
    expect(
      parseLlmUsageFromLlmMessage({
        response_metadata: { usage: { input_tokens: 10, output_tokens: 5 } },
      }),
    ).toEqual({ inputTokens: 10, outputTokens: 5 });
  });
});

describe('addLlmUsage', () => {
  it('accumulates totals', () => {
    const t = { inputTokens: 0, outputTokens: 0 };
    addLlmUsage(t, { inputTokens: 3, outputTokens: 2 });
    addLlmUsage(t, { inputTokens: 1, outputTokens: 1 });
    expect(t).toEqual({ inputTokens: 4, outputTokens: 3 });
  });

  it('ignores null step', () => {
    const t = { inputTokens: 1, outputTokens: 1 };
    addLlmUsage(t, null);
    expect(t).toEqual({ inputTokens: 1, outputTokens: 1 });
  });
});

describe('estimateUsdAnthropicSonnet4Base', () => {
  it('applies $3/M input and $15/M output', () => {
    const usd = estimateUsdAnthropicSonnet4Base(1_000_000, 1_000_000);
    expect(usd).toBeCloseTo(18, 5);
  });

  it('returns 0 for zero tokens', () => {
    expect(estimateUsdAnthropicSonnet4Base(0, 0)).toBe(0);
  });
});
