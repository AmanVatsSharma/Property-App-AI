# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## File Headers (All Code Files)

Every code file created or significantly modified **must** have a top-of-file header before imports. The header is the file's complete self-contained documentation — written so any AI or developer understands the file's full contract without reading the implementation.

**Applies to:** `.ts` `.tsx` `.js` `.jsx` `.py` `.rs` `.go` `.java` `.cpp` `.c` `.cs` `.rb` `.swift` `.kt` `.sh`

#### TypeScript / TSX

```ts
/**
 * File:        <path from repo root, e.g. lib/invoice-transitions.ts>
 * Module:      <logical module / domain, e.g. "Invoices · State Machine">
 * Purpose:     <one sentence — what problem this file solves>
 *
 * Exports:
 *   - <FunctionName>(args) → ReturnType   — <what it does>
 *   - <ComponentName>                      — <what UI it renders / what props it takes>
 *   - <TypeName>                           — <what it models>
 *   (list every public export; omit internals)
 *
 * Depends on:
 *   - <@/lib/foo> — <why it is imported>
 *   (only non-obvious / load-bearing imports; skip framework boilerplate)
 *
 * Side-effects:
 *   - <DB write / HTTP call / file I/O / browser API / none>
 *
 * Key invariants:
 *   - <non-obvious rule the code relies on that types alone don't capture>
 *
 * Read order:
 *   1. <TypeOrFunction> — start here for the data shape
 *   2. <TypeOrFunction> — core logic
 *
 * Author:      <dev name>
 * Last-updated: <YYYY-MM-DD>
 */
```

#### Python

```python
"""
File:        <path from repo root>
Module:      <logical module / domain>
Purpose:     <one sentence>

Exports:
  - function_name(args) -> ReturnType  — what it does
  - ClassName                          — what it models

Depends on:
  - <module> — why imported (skip stdlib unless surprising)

Side-effects:
  - <DB write / HTTP / file I/O / none>

Key invariants:
  - <non-obvious constraint>

Read order:
  1. <ClassOrFunction> — start here
  2. <ClassOrFunction> — core logic

Author:      <dev name>
Last-updated: <YYYY-MM-DD>
"""
```

**Rules:** Every section is mandatory — write "none" when a section has nothing. Last-updated must use the actual date. Do not repeat header content in inline comments.

**Missing header behavior (automatic — no asking):** When opening any code file and the header is absent or incomplete, read the full file, write a complete header at the very top, then continue with the original task. Unconditional — no asking, no skipping.

---

## Subagent Dispatch Protocol

These rules are **absolute** and override any skill that says otherwise.

### 🔒 RULE #0 — ONE CONTEXT, ONE AGENT (non-negotiable)

Whoever holds the warm context for a given body of work owns that work end-to-end. No split. No handoff.

- If **main agent** has built the mental model for module X → **main finishes module X**. No subagent for the same module.
- If a **subagent** owns module Y → **that subagent does ALL of Y** (service + tests + docs + whatever). No second agent on module Y.
- Parallel subagents only for **genuinely different isolated modules** with zero file/state overlap.

### 🧭 Default Bias — DIRECT FIRST

When in doubt → execute directly. Subagents are the exception, not the norm.

- Ambiguous task size → direct
- One qualifying module only → direct
- Cold-start + briefing overhead of a subagent exceeds the task itself → direct

### Gate — when to spawn an Agent

**Both** conditions must be true:

1. **Big work** — touches 5+ files, OR estimated >45 min, OR full module scope
2. **Isolated** — no shared files/state with other in-progress work

**HARD BAN:** single-file edits, bug fixes <5 files, questions, quick lookups — always direct.

### One subagent per module — NOT per task

Dispatch **one subagent** that owns the entire module. Do NOT split a module across multiple agents.

### Smart Briefing (required for every dispatch)

Every subagent prompt must have these sections:

```
## Dispatch Check
- Context ownership: this context is NOT held by main or any other running agent
- Gate passed: big — <5+ files | >45 min | full module scope>
- Isolation: no shared files/state with other in-progress work

## Pre-verified facts
- <file path + line range> : <what exists there>
- <current state> : <what I already checked>
- <decisions made> : <chose X over Y because Z>

## Your scope
- <surgical instructions with exact file paths + line numbers>
- <specific changes to make>

## Trust directive
- Do NOT grep to re-verify the pre-verified facts.
- Do NOT scan directories to orient yourself.
- Read ONLY the specific files listed in your scope.
- Contradiction (claimed line doesn't exist) → STOP + report, do not edit.

## Expected output
- List of files changed + 2–3 line summary. Nothing else.
```

### Anti-Under-Spawning — Mandatory Task Classification

For **substantial** tasks (>3 files OR >20 min OR >1 module), output this block **before any work**:

```
## Task Classification
- Estimated scope:        <N files, ~Y min>
- Modules involved:       <list of top-level modules/directories>
- Isolation:              <fully independent | shared utils/types | sequential deps>
- Main's context state:   <empty | warm for X | warm for multiple>
- Trigger fired (L2):     <none | 3+ modules | multi-feature ask | todos across dirs | >2h splittable>
- Dispatch decision:      <DIRECT | ONE SUBAGENT | PARALLEL (N agents for modules A, B, C)>
- Reason:                 <one sentence>
```

**L2 Positive Trigger** (parallel becomes default): 3+ distinct modules, OR multiple independent features in one message, OR TodoList in 3+ different top-level directories, OR estimated >2h and naturally splittable.

### Authorization is scoped, not durable

User authorizing a subagent for one task **does not** carry forward. The gate resets every task.

---

## Plan File Location

**Always** create plan files in the project's `.claude/` directory, never in `~/.claude/`.

- **Correct**: `{project_root}/.claude/plans/my-plan.md`
- **Incorrect**: `~/.claude/plans/my-plan.md`

Plans survive across sessions, are shared with collaborators who clone the repo, and are version-controlled alongside the project.

---

## Project Overview

**UrbanNest.ai** is an AI-powered real estate platform for Indian markets. Nx monorepo with four apps:

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/api` | NestJS + GraphQL (Apollo) + TypeORM | Backend API |
| `apps/web` | Next.js 16 (App Router) + Tailwind v4 | Consumer-facing web app |
| `apps/admin` | Next.js | Admin dashboard |
| `apps/mobile` | Expo + React Native + NativeWind | iOS/Android app |

## Common Commands

### Development

```bash
npm run dev           # Web app (http://localhost:3000)
npm run dev:api       # API (http://localhost:3333)
npm run dev:all       # API + web concurrently
npm run mobile        # Expo dev server
npm run dev:admin     # Admin app
```

### Build

```bash
npm run build         # Web
npm run build:api     # API
npm run build:admin   # Admin
npm run mobile:apk    # Android debug APK
```

### Testing

```bash
npx nx run api:test                        # API unit tests (Jest via Nx)
npx nx run api:test -- --testPathPattern="agent-orchestrator"  # Single file
cd apps/web && npm test                    # Web unit tests (Vitest)
cd apps/web && npm run e2e                 # Web e2e (Playwright)
npm run test:msg91-sms                     # Test MSG91 via sendotp.php
npm run test:zavu-sms                      # Test Zavu SMS
```

### Lint / Typecheck

```bash
npm run lint                  # Lint all apps
npx nx run api:typecheck     # API type check
```

### Database Migrations

```bash
npx nx run api:migration:run   # Run pending migrations (requires DB_* env)
```

## Local Environment Setup

1. Copy `.env.example` → `.env` in repo root and/or `apps/api/.env.example` → `apps/api/.env`.
2. Start Postgres:
   ```bash
   podman run -d --name property-app-postgres \
     -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=property_app \
     -p 5433:5432 --restart unless-stopped \
     docker.io/library/postgres:16-alpine
   ```
   Default `DB_PORT=5433` matches this setup.
3. Set at least one AI provider key: `GOOGLE_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`.
4. For web: copy root `.env.example` to `apps/web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3333` and `NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:3333/graphql`.

## Architecture

### API (NestJS)

**Entry:** `apps/api/src/main.ts` — bootstraps with Helmet, compression, CORS, versioning, global `ValidationPipe`, WebSocket adapter, Swagger at `/api/docs` (dev only).

**Root module:** `apps/api/src/app/app.module.ts` — wires together GraphQL (Apollo code-first, `autoSchemaFile: true`), TypeORM (PostgreSQL), BullMQ (optional Redis), throttler, JwtModule (global), all feature modules.

**Path aliases:** `@api/shared/*`, `@api/modules/*`, `@api/common/*`, `@api/app/*`, `@api/database/*`.

**Feature modules** (`apps/api/src/modules/`):

- `agent` — LangChain/LangGraph AI agent. GraphQL mutations `askAgent` and `scoreProperty`. Supports Google Gemini (default), OpenAI, Anthropic Claude. Optional BullMQ async queue (`AGENT_QUEUE_ENABLED`). Extended thinking via `AGENT_THINKING_BUDGET_TOKENS`.
- `auth` — OTP-based login for Indian mobiles. Two paths: **GraphQL** (`sendOtp`/`verifyOtp`) via MSG91 sendotp.php, and **REST** (`/auth/otp/*`) via MSG91 Control API v5 with bcrypt-hashed OTP in Redis. Issues JWT on verify.
- `property` — Core listing CRUD with GraphQL. AI scoring (`aiScore`, `aiTip`).
- `area` — Locality/area entity; LLM-backed area assessor with TTL (`AREA_ASSESSMENT_TTL_DAYS`).
- `search` — Search parser using LLM to extract structured filters from natural language.
- `user`, `admin`, `broker`, `favorite`, `enquiry`, `notification`, `saved-search`, `storage`, `mail`, `health`, `metrics` — Feature modules for their respective domains.

**Shared infrastructure** (`apps/api/src/shared/`): `logger` (Pino-based), `config` (Joi-validated env schema), `llm` (LangChain model factories, token usage), `cache`.

**Common layer** (`apps/api/src/common/`): `guards/auth.guard.ts` (global JWT guard; `@Public()` bypasses it), `filters/http-exception.filter.ts`, `interceptors/logging.interceptor.ts`, `throttler/redis-throttler.storage.ts`, `decorators`, `rbac`, `middleware/request-id.middleware.ts`.

**Database:** TypeORM with PostgreSQL. Migrations in `apps/api/src/database/migrations/`. `synchronize: true` in dev. Data source at `apps/api/src/database/data-source.ts`.

**Health / observability:** `GET /health/live`, `GET /health/ready` (DB + Redis), `GET /metrics` (Prometheus). LLM token usage tracked per `llm_tokens_total` counter.

### Web (Next.js)

**App Router** (`apps/web/src/app/`): Routes — `/`, `/search`, `/property/[id]`, `/post-property`, `/emi-calculator`, `/legal-checker`, `/neighbourhood`, `/price-forecast`, `/about`.

**API communication** (`apps/web/src/lib/`): `graphql-client.ts` for property/agent queries, `property-api.ts`, `upload-api.ts`, `api-client.ts`.

**Components** (`apps/web/src/components/`): `layout/` (Nav, Footer, AIFab), `ui/` (Button, Card, PropertyImage), `providers/` (ThemeProvider, AuthProvider, AIFabProvider), `search/`, `landing/`, `post-property/`, `auth/`.

**Theme:** `next-themes` with class-based dark mode; preference persisted in `localStorage` under `urbannest-theme`.

### Mobile (Expo)

Expo Router with file-based navigation. Tabs: Home, Search, Post, More. Stack: property detail (`/property/[id]`), login, modal. NativeWind for styling with shared design tokens from web.

### AI Agent Architecture

The `agent` module uses a **ReAct loop** (LangChain tool-calling):
1. Orchestrator selects LLM based on `AGENT_PROVIDER` (default `google`).
2. Domain system prompt injected; optional plan-first instruction.
3. Loop: invoke model → if tool_calls → execute tools → append `ToolMessage` → repeat (up to `AGENT_MAX_STEPS`).
4. Returns `AskAgentResult { answer, sources, suggestedActions }`.

**Tools available:** `search_properties`, `get_property`, `score_property`, `get_neighbourhood_score`, `assess_region`, `compare_properties`, `create_listing`. Placeholder tools: `get_price_forecast`, `check_rera`, `analyze_document`, `get_negotiation_advice`.

When configured provider's API key is missing, orchestrator returns a stub immediately without calling LLM or returning mock data.

### Auth Flow

- **GraphQL path** (`sendOtp`/`verifyOtp`): uses `OtpStoreService` (Redis or in-memory fallback) + `SmsService`.
- **REST path** (`/auth/otp/*`): requires `REDIS_URL` + `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID`; OTP bcrypt-hashed in Redis.
- Role assignment (`ADMIN_PHONES`, `BROKER_PHONES`) happens at verify time.
- Production startup enforces `SMS_PROVIDER` is not `stub`.

## Key Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_PORT` | Default `5433` for Podman, `5432` for Docker Compose |
| `JWT_SECRET` | Min 16 chars; required in production |
| `AGENT_PROVIDER` | `google` (default), `openai`, or `anthropic` |
| `GOOGLE_API_KEY` | Required when `AGENT_PROVIDER=google` |
| `SMS_PROVIDER` | `stub` (dev) or `twilio`/`msg91`/`zavu` (prod) |
| `REDIS_URL` | Enables BullMQ queue, Redis throttler, Redis OTP store |
| `AGENT_QUEUE_ENABLED` | When `true` + `REDIS_URL`: `askAgent` returns `jobId`, poll `agentJobStatus` |

## Coding Standards

### Architecture Rules
- Resolvers/controllers stay thin — delegate to services; no business logic in resolvers/controllers
- Services handle business logic only; repositories handle DB logic only
- Use dependency injection over direct instantiation
- All API inputs use DTOs with `class-validator`
- Use domain errors from `src/common/errors/` (`AppError`, `PropertyNotFoundError`, `ValidationError`)

### Naming
- Files: kebab-case (`property.service.ts`)
- Components: PascalCase (`PropertyCard.tsx`)
- Hooks: camelCase prefixed with `use` (`useAuth`)
- Env vars: UPPER_SNAKE_CASE
- GraphQL types/fields: camelCase

### Error Handling
- All errors extend `AppError`
- Use domain errors: `PropertyNotFoundError`, `ValidationError`, `UserNotFoundError`, `AgentError`
- Never throw raw `Error` or ad-hoc strings
- Global `ExceptionFilter` maps domain errors to HTTP status codes

### Logging
- Use Pino logger from `src/shared/logger.ts` — never `console.log`
- Inject logger instead of direct instantiation
- Add `logger.debug` at start/end of service methods for traceability
- Each request attaches `requestId` via middleware for log correlation

### Authentication
- Routes protected by default (global `AuthGuard`)
- Use `@Public()` decorator for unauthenticated endpoints
- Use `@UseGuards(AdminGuard)` or role-specific guards for admin-only operations

## Module Documentation

Each feature module must include a `MODULE_DOC.md` with:
- Purpose and overview
- Data flows and key interactions
- List of entities and relationships

When editing a module, update its `MODULE_DOC.md` and the changelog.

## Testing Notes

- API tests use Jest (`npx nx run api:test`). LangChain packages mocked via `apps/api/jest-mocks/`.
- `moduleNameMapper` in `apps/api/jest.config.js` maps `@api/*` aliases.
- TypeORM `synchronize: true` is active in development; migrations are canonical schema source for production.
- Each `MODULE_DOC.md` is the authoritative documentation for that module.
- Use Zod schemas in tests to verify DTO shape.

## Security

- Never commit API keys, passwords, or tokens — use environment variables
- All API inputs go through DTOs with `class-validator` — no raw body/params in services
- Use existing guards (`AuthGuard`, `AdminGuard`) — don't bypass auth
- Mark public endpoints explicitly with `@Public()`
- Validate and sanitize all inputs to prevent injection
