# Module: agent

**Short:** Single LangChain/LangGraph AI agent for all property-platform AI tasks; supports **OpenAI** and **Claude** with extended thinking and domain-expert behaviour.

**Purpose:** Orchestrate conversational search, property scoring, neighbourhood insight, price narrative, legal check, negotiation advice, and property comparison via one agent with tools. Expose **askAgent** and **scoreProperty** over GraphQL; when queue is enabled, **askAgent** returns a job ID and callers poll **agentJobStatus**. Provider-selectable (OpenAI or Anthropic Claude); optional Claude extended thinking and plan-first reasoning.

**Files:**
- `agent.module.ts` — Nest module; imports PropertyModule, AreaModule, BullMQ queue; exports AgentOrchestratorService, AgentQueueService
- `resolvers/agent.resolver.ts` — GraphQL: **askAgent** (mutation), **agentJobStatus** (query), **scoreProperty** (mutation)
- `services/agent-orchestrator.service.ts` — Model factory (OpenAI/Claude), ReAct loop, domain prompt, plan-first
- `services/agent-tools.service.ts` — Tool registry and invocation (see tool list below)
- `services/agent-queue.service.ts` — BullMQ add job, get job status/result
- `processors/agent.processor.ts` — BullMQ processor for async ask
- `prompts/domain-system.prompt.ts` — Domain expert system prompt and plan-first instruction
- `config/agent-config.ts` — Typed config and env key constants (provider, models, thinking, plan-first, queue)
- `dtos/ask-agent-input.dto.ts` — AskAgentInput (prompt, context, conversationHistory)
- `dtos/ask-agent-result.dto.ts` — AskAgentResult (answer, sources, suggestedActions)
- `dtos/ask-agent-async-result.dto.ts` — AskAgentAsyncResult (jobId)
- `dtos/agent-job-status.dto.ts` — AgentJobStatusResult (status, result?)
- `__tests__/` — Unit tests (orchestrator, tools)
- `MODULE_DOC.md` — this file

**Tool list (agent-tools.service):** search_properties, get_property, score_property, get_neighbourhood_score, assess_region, get_price_forecast, check_rera, analyze_document, get_negotiation_advice, compare_properties, create_listing.

**search_properties tool:** Accepts query, location, min_price, max_price, bedrooms, type (apartment, villa, plot, etc.), sort_by (createdAt | price | aiScore), sort_order (asc | desc), limit. Returns ToolResult with content (text summary) and sources (one per property: type 'property', label, id) so clients can render property cards.

**Dependencies:** PropertyModule (search, get, update, create), AreaModule (getOrCreate, area assessment), ConfigModule (env), LoggerModule. Optional: **BullMQ**, **Redis** for async jobs when AGENT_QUEUE_ENABLED and REDIS_URL are set. AgentRateLimitGuard (AGENT_RATE_LIMIT_PER_MIN).

**APIs (GraphQL):**
- **askAgent(input: AskAgentInput!): AgentAskResponse!** — Union of AskAgentResult | AskAgentAsyncResult. When queue disabled: runs agent synchronously and returns answer, sources, suggestedActions. When queue enabled (AGENT_QUEUE_ENABLED + REDIS_URL): enqueues job and returns `{ jobId }`; poll **agentJobStatus(jobId)** for result.
- **agentJobStatus(jobId: String!): AgentJobStatusResult!** — Query; returns `{ status, result? }`. Status: waiting, active, completed, failed, not_found. Result present when status is completed.
- **scoreProperty(propertyId: ID!): Property** — Mutation; runs scoring (area + property) and persists aiScore/aiTip on the property entity; returns updated Property.

**Env vars:**
- **AGENT_PROVIDER** — `openai` (default) or `anthropic`
- **OPENAI_API_KEY** — required when provider is openai
- **AGENT_MODEL** — OpenAI model (default gpt-4o)
- **ANTHROPIC_API_KEY** — required when provider is anthropic
- **AGENT_ANTHROPIC_MODEL** — Claude model (default claude-sonnet-4-20250514)
- **AGENT_THINKING_BUDGET_TOKENS** — optional; when set and provider is anthropic, enables Claude extended thinking (budget in tokens)
- **AGENT_PLAN_FIRST** — optional; when true, system prompt asks model to state plan in one line before calling tools
- **AGENT_MAX_STEPS** — max tool-call steps per ask (default 10)
- **AGENT_QUEUE_ENABLED** — when true and REDIS_URL set, askAgent returns jobId; poll agentJobStatus(jobId) for result
- **REDIS_URL** — optional; required for BullMQ queue
- **AGENT_RATE_LIMIT_PER_MIN** — per-IP limit for agent mutations (default 10)

**Flow:** Client calls **askAgent(input)** → Resolver (if queue enabled: add job, return jobId; else) → Orchestrator.ask() → createLlm() (OpenAI or Claude, optional extended thinking) → domain system prompt (+ plan-first instruction if enabled) → ReAct loop (invoke → tool_calls → ToolMessages → repeat until no tool calls or max steps) → AskAgentResult. For **scoreProperty(propertyId)** → AgentToolsService.scoreAndPersistProperty → PropertyService.findOne, AreaService.getOrCreate (assess if missing), compute score/tip, PropertyService.update.

**Scoring and long-thinking:** For "is this a good deal" or property scoring flows, recommend setting **AGENT_THINKING_BUDGET_TOKENS** (e.g. 4096) and **AGENT_PLAN_FIRST=true** so the model can plan multi-step (e.g. assess_region → score_property) and reason over locality and listing details.

**MVP/deploy:** Set OPENAI_API_KEY or ANTHROPIC_API_KEY per AGENT_PROVIDER; when keys are missing the orchestrator returns a stub message (no mock listing or user data). No fake responses in production when configured.

---

**Stub when API keys missing:** If the configured provider’s API key is missing or empty, the orchestrator does **not** call the LLM. It returns immediately with:
- **answer:** A single message string: for OpenAI, `"AI agent is not configured (missing OPENAI_API_KEY). Set it in the environment to use the assistant."`; for Anthropic, `"AI agent is not configured (missing ANTHROPIC_API_KEY). Set it in the environment to use Claude."`
- **sources:** `[]`
- **suggestedActions:** `[]`
No mock listing data, no fake property or user data, and no tool execution.

**Coming soon tool placeholders:** Four tools are implemented as placeholders that return a short “coming soon” message only (no real integration yet):
- **get_price_forecast** — Returns: *"Price forecast for localities is coming soon. This feature will use demand and infrastructure data in a future update."*
- **check_rera** — Returns: *"RERA verification is coming soon. Real-time RERA API integration will be available in a future update."*
- **analyze_document** — Returns: *"Document and legal risk analysis is coming soon. This feature will be available in a future update."*
- **get_negotiation_advice** — For a valid property ID returns a line that includes *"Coming soon. Comparables and bid strategy will be available in a future update."*; for unknown ID returns *"Property &lt;id&gt; not found."*

**No mock listing data:** The agent module does **not** use or return mock/fake listing or user data. Search and property tools read from the real PropertyService (database). When API keys are missing, only the stub message above is returned; no listings are injected or simulated.

---

**Change-log:**
- 2025-03-15: search_properties extended with min_price, type, sort_by, sort_order; returns ToolResult with sources (property id per result) for client card display. Aligns agent filters with PropertyFilterDto (location, price range, bedrooms, type, sort).
- 2026-03-15: MVP readiness: documented stub (when API keys missing) and Coming soon tool placeholders; no mock listing data.
- 2025-03-11: Added agent module scaffold (resolver, orchestrator, tools service, DTOs, config).
- 2025-03-11: Implemented LangChain/LangGraph orchestrator with ChatOpenAI and ReAct-style tool loop; eight tools (search, get property, score, neighbourhood, price forecast, RERA, document analysis, negotiation); askAgent and scoreProperty GraphQL mutations; env schema and AgentError; unit tests for orchestrator and tools.
- 2025-03-12: Async agent: BullMQ queue (AgentQueueService, AgentProcessor); askAgent returns union AgentAskResponse (AskAgentResult | AskAgentAsyncResult); agentJobStatus(jobId) for polling. AgentRateLimitGuard (AGENT_RATE_LIMIT_PER_MIN). Env AGENT_RATE_LIMIT_PER_MIN.
- 2025-03-11: Claude support: AGENT_PROVIDER (openai | anthropic), ANTHROPIC_API_KEY, AGENT_ANTHROPIC_MODEL, model factory in orchestrator. Claude extended thinking via AGENT_THINKING_BUDGET_TOKENS. Domain expert system prompt (Indian real estate terminology, reasoning guidelines). Optional plan-first instruction (AGENT_PLAN_FIRST). Richer tool descriptions (BHK, ₹/lakh/Cr, RERA, etc.). New compare_properties tool (2–5 IDs). Tests and MODULE_DOC updated.
- 2025-03-12: User context and create_listing: Resolver passes req.user.sub as userId to orchestrator and queue job. AskAgentInput supports optional conversationHistory (multi-turn). New create_listing tool (title, location, price, type, listing_for, bedrooms, bathrooms); requires signed-in user; calls PropertyService.create with createdByUserId. Domain prompt updated for posting listings.
- 2025-03-13: Property rating and region persistence: AreaModule for get-or-create Area by locality/city; AreaAssessorService (LLM-based assessment, TTL). get_neighbourhood_score and score_property use AreaService and persisted area data; new assess_region tool. score_property and scoreAndPersistProperty compute score from area + property and persist aiScore/aiTip. Domain prompt: assess_region then score_property; recommend AGENT_THINKING_BUDGET_TOKENS and AGENT_PLAN_FIRST for scoring flows.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
