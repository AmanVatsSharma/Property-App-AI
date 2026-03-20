# Module: search

**Short:** Natural-language property search parsing (LLM) for AI search and one-shot NL endpoints.

**Purpose:** Parse user queries like "3 BHK near school near metro in Bangalore under 1 Cr" into structured filter params (location, bedrooms, min/max price, type, schoolsScoreMin, connectivityScoreMin) using the same LLM config as the agent. Used by REST `POST /api/v1/search` and GraphQL `searchPropertiesByQuery(query)`.

**Files:**
- `search.module.ts` — Nest module; exports SearchParserService.
- `services/search-parser.service.ts` — LLM-based parser; returns ParsedSearchParams.
- `prompts/search-parse.prompt.ts` — Prompt for structured JSON output.
- `MODULE_DOC.md` — this file.

**Dependencies:** ConfigModule (global), LoggerModule, MetricsModule (LLM token counter), LangChain (OpenAI/Anthropic) via AGENT_CONFIG_KEYS.

**APIs:** None directly; consumed by PropertyModule (SearchController, PropertyResolver.searchPropertiesByQuery).

**Observability:** Each successful LLM parse logs `search parse LLM usage` with `llmInputTokens`, `llmOutputTokens`, and (for Anthropic) `llmEstimatedUsdSonnet4Base`; increments `llm_tokens_total{feature="search_parse",...}`. See `docs/llm-token-billing.md`.

**Change-log:**
- 2026-03-20: Token usage logging and Prometheus `llm_tokens_total` for search parse (MetricsModule).
- 2026-03-17: Initial: SearchParserService and prompt for NL → structured filters; area intents (schoolsScoreMin, connectivityScoreMin) for "near school"/"near metro".
