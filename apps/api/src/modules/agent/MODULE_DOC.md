# Module: agent

**Short:** Single LangChain/LangGraph AI agent for all property-platform AI tasks.

**Purpose:** Orchestrate conversational search, property scoring, neighbourhood insight, price narrative, legal check, negotiation advice via one agent with tools. Expose `askAgent` (and optional `scoreProperty`) over GraphQL.

**Files:**
- agent.module.ts — Nest module
- resolvers/agent.resolver.ts — GraphQL mutations
- services/agent-orchestrator.service.ts — LangGraph loop
- services/agent-tools.service.ts — Tool registry and invocation
- tools/ — search, getProperty, scoreProperty, neighbourhood, price-forecast, rera, document-analysis, negotiation
- dtos/ — AskAgentInput, AskAgentResult
- config/agent-config.ts — Env-derived config
- MODULE_DOC.md — this file
- __tests__/ — unit tests

**Flow:** Client calls `askAgent(input)` → Resolver → Orchestrator.ask() → LLM + tools loop → AskAgentResult (answer, sources, suggestedActions).

**Dependencies:** PropertyModule (for search/get/update), ConfigModule (env), LoggerModule. Optional: BullMQ, Redis for async jobs.

**APIs (GraphQL):**
- `askAgent(input: AskAgentInput!): AskAgentResult!` — main entry; runs agent and returns answer + sources.
- `scoreProperty(propertyId: ID!)` — optional; runs scoring tool and updates entity aiScore/aiTip.

**Env vars:**
- OPENAI_API_KEY — required for LLM
- AGENT_MODEL — default gpt-4o
- AGENT_MAX_STEPS — max tool-call steps
- AGENT_QUEUE_ENABLED — use queue for long runs
- REDIS_URL — optional, for queue/cache

**Change-log:**
- 2025-03-11: Added agent module scaffold (resolver, orchestrator, tools service, DTOs, config).
- 2025-03-11: Implemented LangChain/LangGraph orchestrator with ChatOpenAI and ReAct-style tool loop; eight tools (search, get property, score, neighbourhood, price forecast, RERA, document analysis, negotiation); askAgent and scoreProperty GraphQL mutations; env schema and AgentError; unit tests for orchestrator and tools.
