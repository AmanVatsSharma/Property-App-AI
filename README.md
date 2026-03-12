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

## Environment

Copy [.env.example](.env.example) to `.env` in the repo root (or set vars in the shell). Do not commit `.env`. All API vars are documented in `.env.example`; key ones:

- **API:** `DB_*`, `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, optional `JWT_SECRET`, `REDIS_URL` if using async agent.
- **Web:** `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_GRAPHQL_HTTP` (e.g. `http://localhost:3333/graphql`) so the web app can call the API.
- **Mobile:** `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_GRAPHQL_HTTP` (e.g. `http://localhost:3333` or `http://localhost:3333/graphql`) so the Expo app can reach the API; set in app config or env when running `npm run mobile`.

## Run full stack (web + API + DB)

To run the web app with the NestJS API and database:

1. **Start PostgreSQL** and create a database (e.g. `property_app`).
2. **Optional:** Start Redis if you use the async agent queue (`AGENT_QUEUE_ENABLED=true`, `REDIS_URL=redis://localhost:6379`).
3. **Environment:** Copy `.env.example` to `.env` and set at least:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for Postgres
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for the AI agent
   - For web: `NEXT_PUBLIC_API_URL=http://localhost:3333` or `NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:3333/graphql`
   - For mobile: `EXPO_PUBLIC_API_URL=http://localhost:3333` or `EXPO_PUBLIC_GRAPHQL_HTTP=http://localhost:3333/graphql` (see [apps/mobile/README.md](apps/mobile/README.md) for env setup)
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

## Run tests

- **Web (unit):** `cd apps/web && npm run test` (Vitest). **Web (e2e):** Start the web app (`npm run dev`), then in another terminal `cd apps/web && npm run e2e` (Playwright).
- **API e2e:** Build and start the API (e.g. `npm run dev:api` in one terminal with DB and env set), then run `npx nx run api-e2e:e2e` (uses port 3333 by default).

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

## Production and security

For production deployments:

- **CORS:** Set `CORS_ORIGIN` to explicit origins (e.g. `https://yourdomain.com`) instead of `*`.
- **Auth:** Set `JWT_SECRET` (min 16 characters). When unset, the API skips JWT validation; in production you should set it so protected routes require a valid token.
- **Rate limits:** Tune `THROTTLE_TTL` / `THROTTLE_LIMIT` and `AGENT_RATE_LIMIT_PER_MIN` per environment if needed.

## Deployment

- **Build for production:** From repo root run `npx nx run api:build` (output under `dist/`) and `npx nx run web:build` (output in `apps/web/.next`). Run the API with Node (e.g. `node dist/apps/api/main.js`) and the web app with `npm run start` from `apps/web` or your host (e.g. Vercel runs `next start`).
- **Health check:** The API exposes `GET /health` (Terminus: DB and Redis). Use this URL as the load balancer or orchestrator health check so traffic is only sent when the app and DB are ready.
- **Hosting:** Web can be deployed to Vercel, Netlify, or any Node host; API to Railway, Render, or any Node host with Postgres (and optional Redis).

## Deploy checklist

- [ ] DB migrations run (or `synchronize: false` in production and migrations applied separately).
- [ ] Env set for production (see [.env.example](.env.example)); at least `NODE_ENV=production`, `DB_*`, `CORS_ORIGIN`, `JWT_SECRET` if using auth.
- [ ] Health endpoint (`GET /health`) returns 200 before accepting traffic.
- [ ] Web `NEXT_PUBLIC_*` or API URL configured for the deployed API origin.

## Resiliency and operations

- **DB migrations:** Run TypeORM migrations (or ensure `synchronize` is off in production) as part of your deploy process. Migrations live under `apps/api/src/database/migrations/`.
- **Agent queue:** When `AGENT_QUEUE_ENABLED` and `REDIS_URL` are set, agent jobs run via BullMQ. Failed jobs use BullMQ’s default retry behavior unless overridden in queue options.
- **Graceful shutdown:** NestJS closes the HTTP server and app on SIGTERM/SIGINT. Ensure your process manager (e.g. systemd, Kubernetes) sends SIGTERM and allows a short drain period.

## Docs

Changelog and module docs: [docs/CHANGELOG.md](docs/CHANGELOG.md).
