/**
 * @file llm-token-usage.ts
 * @module shared/llm
 * @description Parses LangChain AIMessage usage_metadata for observability and estimated Claude Sonnet 4 API cost.
 * @author BharatERP
 * @created 2026-03-20
 */

/** Base input $/MTok for Claude Sonnet 4 family; confirm on Anthropic pricing page before budgeting. */
export const ANTHROPIC_SONNET_4_INPUT_USD_PER_MTOK = 3;

/** Base output $/MTok for Claude Sonnet 4 family; confirm on Anthropic pricing page before budgeting. */
export const ANTHROPIC_SONNET_4_OUTPUT_USD_PER_MTOK = 15;

export interface LlmTokenTotals {
  inputTokens: number;
  outputTokens: number;
}

export function estimateUsdAnthropicSonnet4Base(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * ANTHROPIC_SONNET_4_INPUT_USD_PER_MTOK +
    (outputTokens / 1_000_000) * ANTHROPIC_SONNET_4_OUTPUT_USD_PER_MTOK
  );
}

/**
 * Reads token counts from LangChain chat responses (usage_metadata or response_metadata.usage).
 */
export function parseLlmUsageFromLlmMessage(msg: unknown): LlmTokenTotals | null {
  if (!msg || typeof msg !== 'object') {
    return null;
  }
  const m = msg as {
    usage_metadata?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
    response_metadata?: { usage?: Record<string, number> };
  };
  const um = m.usage_metadata;
  if (um != null && (typeof um.input_tokens === 'number' || typeof um.output_tokens === 'number')) {
    return {
      inputTokens: typeof um.input_tokens === 'number' ? um.input_tokens : 0,
      outputTokens: typeof um.output_tokens === 'number' ? um.output_tokens : 0,
    };
  }
  const usage = m.response_metadata?.usage;
  if (usage != null) {
    const input =
      typeof usage.prompt_tokens === 'number'
        ? usage.prompt_tokens
        : typeof usage.input_tokens === 'number'
          ? usage.input_tokens
          : undefined;
    const output =
      typeof usage.completion_tokens === 'number'
        ? usage.completion_tokens
        : typeof usage.output_tokens === 'number'
          ? usage.output_tokens
          : undefined;
    if (typeof input === 'number' || typeof output === 'number') {
      return {
        inputTokens: input ?? 0,
        outputTokens: output ?? 0,
      };
    }
  }
  return null;
}

export function addLlmUsage(totals: LlmTokenTotals, step: LlmTokenTotals | null): void {
  if (!step) {
    return;
  }
  totals.inputTokens += step.inputTokens;
  totals.outputTokens += step.outputTokens;
}

export function buildLlmUsageLogFields(
  feature: string,
  provider: 'openai' | 'anthropic' | 'google',
  inputTokens: number,
  outputTokens: number,
): Record<string, string | number | boolean> {
  const fields: Record<string, string | number | boolean> = {
    llmFeature: feature,
    llmProvider: provider,
    llmInputTokens: inputTokens,
    llmOutputTokens: outputTokens,
    llmTotalTokens: inputTokens + outputTokens,
  };
  if (provider === 'anthropic') {
    fields.llmEstimatedUsdSonnet4Base = Number(
      estimateUsdAnthropicSonnet4Base(inputTokens, outputTokens).toFixed(6),
    );
  }
  return fields;
}
