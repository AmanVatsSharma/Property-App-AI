# Changelog

## [Unreleased]

### Added

- **Enterprise LangChain AI Agent (apps/api)** — New `agent` module: single LangChain/LangGraph-style orchestrator with eight tools (search_properties, get_property, score_property, get_neighbourhood_score, get_price_forecast, check_rera, analyze_document, get_negotiation_advice). GraphQL: `askAgent(input: AskAgentInput!): AskAgentResult!` and `scoreProperty(propertyId: ID!): Property`. Env: `OPENAI_API_KEY`, `AGENT_MODEL`, `AGENT_MAX_STEPS`, `AGENT_QUEUE_ENABLED`, `REDIS_URL`. Tools use PropertyService for search/get/update; neighbourhood, forecast, RERA, document, negotiation return placeholders for future integrations. Unit tests for orchestrator and tools. See [apps/api/src/modules/agent/MODULE_DOC.md](../apps/api/src/modules/agent/MODULE_DOC.md).
- **Theme contrast and alignment polish (apps/web)** — Semantic tokens: `--heading`, `--btn-primary-text`, `--nav-bg`, `--ann-bar-bg`, `--hover-bg`, `--outline-stroke` in :root and .light. Header and announcement bar use theme-aware backgrounds; all headings/titles use `--heading`; primary buttons use `--btn-primary-text`. Light overrides for nav shadow, card hover shadow, map grid bg. Body line-height 1.6; nav min-height for tap targets. Shared tokens: `heading` and `btnPrimaryText` in libs/shared theme.ts.
- **next-themes and light theme (apps/web)** — Installed next-themes; added ThemeProvider (class-based, default dark, storageKey `urbannest-theme`); matching light theme via `.light` CSS variable overrides in globals.css (same token names, light palette); theme toggle in Nav (sun/moon, aria-label). Optional: `colorsLight` and `themeLight` in libs/shared tokens for JS access.
- **Enterprise API hardening (apps/api)** — Config module with Joi env validation; health module (Terminus, DB check); LoggingInterceptor and TimeoutInterceptor; ThrottlerGuard, AuthGuard placeholder, Helmet, explicit CORS; repository layer for property; strict feature layout (resolvers/, services/, dtos/, repository/, __tests__); LoggerService with entry/exit debug logs; GraphQL formatError and error codes (common/errors/errors.constants.ts); initial DB migration (CreateProperty). Run: `npm run dev:api`, `npm run build:api`.
- **NestJS GraphQL backend (apps/api)** — NestJS API with GraphQL (Apollo, code-first), TypeORM (Postgres), and property module. Queries: `properties(filter?)`, `property(id)`; mutations: `createProperty`, `updateProperty`, `deleteProperty`. Shared: Pino logger, `AppError`/domain errors, requestId middleware, global ValidationPipe. Run: `npm run dev:api`, `npm run build:api`. GraphQL playground at `http://localhost:3333/graphql`. Env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. See [apps/api/README.md](../apps/api/README.md).
- **Native mobile app (apps/mobile)** — Expo (React Native) app with NativeWind (Tailwind) and TypeScript. Mirrors web flows: Landing, Search, Property detail, Post property, More (About, EMI Calculator, Legal Checker, Neighbourhood, Price Forecast). Design tokens aligned with web. Run: `npm run mobile`, `npm run mobile:ios`, `npm run mobile:android`. See [apps/mobile/README.md](../apps/mobile/README.md).
- **libs/shared** — Shared design tokens (colors, radius) and types (nav links, property card) for web and mobile consistency. Path alias: `@property-app-ai/shared`.
- **Nx monorepo** — Repo converted to Nx workspace. Root `package.json` with workspaces `["apps/*"]`, `nx.json` for cache and task defaults, and `tsconfig.base.json` for shared TypeScript config.
- **apps/web** — Next.js app moved from `web/` to `apps/web`. Same UrbanNest.ai app (App Router, layout, routes); now managed by Nx with `@nx/next` plugin. Root scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` run via Nx.

### Changed

- Next.js app location: `web/` → `apps/web/`.
- `apps/web/tsconfig.json` now extends `../../tsconfig.base.json`; app path alias `@/*` unchanged.
- Build/serve/lint executed from repo root using Nx (with caching).

### Technical

- Nx 21 + `@nx/next` plugin. Project `web` discovered from `apps/web`; targets inferred from package scripts and Next plugin. Second `nx run web:build` uses cache.
