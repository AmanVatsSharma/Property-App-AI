# Property-App-AI (UrbanNest.ai)

Nx monorepo for the UrbanNest.ai property platform. **Web** app in `apps/web` (Next.js). **Native mobile** app in `apps/mobile` (Expo + React Native + NativeWind).

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- PostgreSQL (for the API)
- Optional: Redis (for async agent queue when `AGENT_QUEUE_ENABLED=true`)

## Quick start

From the repo root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run full stack (web + API + DB)

To run the web app with the NestJS API and database:

1. **Start PostgreSQL** and create a database (e.g. `property_app`).
2. **Optional:** Start Redis if you use the async agent queue (`AGENT_QUEUE_ENABLED=true`, `REDIS_URL=redis://localhost:6379`).
3. **Environment:** In the repo root or `apps/api`, set at least:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for Postgres
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for the AI agent
   - For web: `NEXT_PUBLIC_API_URL=http://localhost:3333` or `NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:3333/graphql`
4. **Terminals:**
   - API: `npm run dev:api` (NestJS on port 3333, GraphQL at `/graphql`)
   - Web: `npm run dev` (Next.js on port 3000)

Then open [http://localhost:3000](http://localhost:3000); the web app will call the API for properties and the AI assistant.

## Scripts (from root)

| Script           | Command                   | Description                |
|------------------|---------------------------|----------------------------|
| `dev`            | `nx run web:dev`          | Start Next.js dev server   |
| `dev:api`        | `nx run api:serve`        | Start NestJS API (port 3333) |
| `build`          | `nx run web:build`        | Production build (web)     |
| `build:api`      | `nx run api:build`        | Production build (API)     |
| `start`          | `nx run web:start`        | Start production server    |
| `mobile`         | `nx run mobile:start`     | Start Expo (mobile)       |
| `mobile:ios`     | `nx run mobile:run-ios`   | Run on iOS simulator      |
| `mobile:android` | `nx run mobile:run-android` | Run on Android emulator |
| `lint`           | `nx run-many -t lint`     | Lint all projects         |

## Nx commands

- `npx nx run web:build` — build the web app (with caching)
- `npx nx run web:dev` — same as `npm run dev`
- `npx nx graph` — view project graph (if Nx Cloud or graph is enabled)

## Structure

- **apps/web** — Next.js 16 app (UrbanNest.ai web). See [apps/web/README.md](apps/web/README.md).
- **apps/api** — NestJS GraphQL API (property CRUD, AI agent). See [apps/api/README.md](apps/api/README.md) if present.
- **apps/mobile** — Expo (React Native) app with NativeWind. See [apps/mobile/README.md](apps/mobile/README.md).
- **libs/shared** — Shared design tokens, types, and GraphQL client helpers for web and mobile.
- **HTML/** — Original static HTML; reference only.
- **nx.json**, **tsconfig.base.json** — Nx workspace and shared TypeScript config.

## Docs

Changelog and module docs: [docs/CHANGELOG.md](docs/CHANGELOG.md).
