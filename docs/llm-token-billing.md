# LLM token usage and Claude billing estimates

**Purpose:** How to derive Anthropic (Claude) API cost from this app’s logs and Prometheus metrics.

## Log fields (structured)

After each LLM call, the API logs include when LangChain exposes usage metadata:

| Field | Meaning |
|-------|---------|
| `llmFeature` | `agent_ask`, `search_parse`, `area_assess`, or `price_forecast` |
| `llmProvider` | `anthropic` or `openai` |
| `llmInputTokens` | Prompt tokens for that event (or cumulative for `agent_ask` completion logs) |
| `llmOutputTokens` | Completion tokens (same scope as input) |
| `llmTotalTokens` | Sum of input + output |
| `llmEstimatedUsdSonnet4Base` | Only when `llmProvider` is `anthropic`: rough USD at **$3/M input + $15/M output** (Claude Sonnet 4 base rates—[verify on Anthropic pricing](https://docs.anthropic.com/en/about-claude/pricing)) |
| `llmTokenUsageMissing` | `true` when the provider response had no usage block (rare; upgrade LangChain/providers if persistent) |

**Agent (`agent_ask`):** `llmInputTokens` / `llmOutputTokens` on `ask completed` and `ask completed (max steps)` are **totals across all model steps** in that `askAgent` invocation.

## Prometheus

Counter `llm_tokens_total` labels:

- `feature`: `agent_ask` | `search_parse` | `area_assess` | `price_forecast`
- `provider`: `anthropic` | `openai`
- `token_type`: `input` | `output`

Values increment by the token count reported for each LLM response.

### Monthly Claude cost from metrics (illustrative)

1. For a 30-day window, sum increased counter value per label (exact PromQL depends on your scrape/restart cadence).
2. For **Anthropic Sonnet 4 base pricing**:

   `estimated_usd ≈ (sum_input_tokens / 1e6) * 3 + (sum_output_tokens / 1e6) * 15`

   Use only `provider="anthropic"` series. OpenAI usage is counted separately and is **not** converted to USD in metrics.

## Monthly cost from logs (illustrative)

Aggregate JSON logs (e.g. in your log stack) where `llmProvider == "anthropic"`:

- Sum `llmInputTokens` and `llmOutputTokens` per feature (or globally).
- Apply the same formula as above.

## Implementation reference

- Parser and helpers: [`apps/api/src/shared/llm/llm-token-usage.ts`](../apps/api/src/shared/llm/llm-token-usage.ts)
- Metrics: [`apps/api/src/modules/metrics/services/metrics.service.ts`](../apps/api/src/modules/metrics/services/metrics.service.ts)
