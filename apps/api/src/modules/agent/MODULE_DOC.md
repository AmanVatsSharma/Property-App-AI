# Module: agent

**Short:** Single LangChain/LangGraph AI agent for all property-platform AI tasks; supports OpenAI and Claude with extended thinking and domain expert behaviour.

**Purpose:** Orchestrate conversational search, property scoring, neighbourhood insight, price narrative, legal check, negotiation advice, and property comparison via one agent with tools. Expose `askAgent` and `scoreProperty` over GraphQL. Provider-selectable (OpenAI or Anthropic Claude); optional Claude extended thinking and plan-first reasoning.

**Files:**
- agent.module.ts — Nest module
- resolvers/agent.resolver.ts — GraphQL mutations
- services/agent-orchestrator.service.ts — Model factory (OpenAI/Claude), ReAct loop, domain prompt, plan-first
- services/agent-tools.service.ts — Tool registry and invocation (nine tools including compare_properties)
- prompts/domain-system.prompt.ts — Domain expert system prompt and plan-first instruction
- tools/ — search, getProperty, scoreProperty, neighbourhood, price-forecast, rera, document-analysis, negotiation
- dtos/ — AskAgentInput, AskAgentResult
- config/agent-config.ts — Env-derived config (provider, models, thinking, plan-first)
- MODULE_DOC.md — this file
- __tests__/ — unit tests

**Flow:** Client calls `askAgent(input)` → Resolver → Orchestrator.ask() → createLlm() (OpenAI or Claude, optional extended thinking) → domain system prompt (+ plan-first instruction if enabled) → ReAct loop (invoke → tool_calls → ToolMessages → repeat) → AskAgentResult.

**Dependencies:** PropertyModule (for search/get/update), ConfigModule (env), LoggerModule. Optional: BullMQ, Redis for async jobs.

**APIs (GraphQL):**
- `askAgent(input: AskAgentInput!): AskAgentResult!` — main entry; runs agent and returns answer + sources + suggestedActions.
- `scoreProperty(propertyId: ID!)` — runs scoring tool and updates entity aiScore/aiTip.

**Env vars:**
- AGENT_PROVIDER — `openai` (default) or `anthropic`
- OPENAI_API_KEY — required when provider is openai
- AGENT_MODEL — OpenAI model (default gpt-4o)
- ANTHROPIC_API_KEY — required when provider is anthropic
- AGENT_ANTHROPIC_MODEL — Claude model (default claude-sonnet-4-20250514)
- AGENT_THINKING_BUDGET_TOKENS — optional; when set and provider is anthropic, enables Claude extended thinking (budget in tokens)
- AGENT_PLAN_FIRST — optional; when true, system prompt asks model to state plan in one line before calling tools
- AGENT_MAX_STEPS — max tool-call steps (default 10)
- AGENT_QUEUE_ENABLED — when true and REDIS_URL set, askAgent returns jobId; poll agentJobStatus(jobId) for result
- REDIS_URL — optional, for BullMQ queue
- AGENT_RATE_LIMIT_PER_MIN — per-IP limit for agent mutations (default 10)

**APIs (GraphQL) — async:** When queue enabled, `askAgent` returns `AskAgentAsyncResult { jobId }`. Use `agentJobStatus(jobId)` to poll until status is `completed` and get `result`.

**Change-log:**
- 2025-03-11: Added agent module scaffold (resolver, orchestrator, tools service, DTOs, config).
- 2025-03-11: Implemented LangChain/LangGraph orchestrator with ChatOpenAI and ReAct-style tool loop; eight tools (search, get property, score, neighbourhood, price forecast, RERA, document analysis, negotiation); askAgent and scoreProperty GraphQL mutations; env schema and AgentError; unit tests for orchestrator and tools.
- 2025-03-12: Async agent: BullMQ queue (AgentQueueService, AgentProcessor); askAgent returns union AgentAskResponse (AskAgentResult | AskAgentAsyncResult); agentJobStatus(jobId) for polling. AgentRateLimitGuard (AGENT_RATE_LIMIT_PER_MIN). Env AGENT_RATE_LIMIT_PER_MIN.
- 2025-03-11: Claude support: AGENT_PROVIDER (openai | anthropic), ANTHROPIC_API_KEY, AGENT_ANTHROPIC_MODEL, model factory in orchestrator. Claude extended thinking via AGENT_THINKING_BUDGET_TOKENS. Domain expert system prompt (Indian real estate terminology, reasoning guidelines). Optional plan-first instruction (AGENT_PLAN_FIRST). Richer tool descriptions (BHK, ₹/lakh/Cr, RERA, etc.). New compare_properties tool (2–5 IDs). Tests and MODULE_DOC updated.
