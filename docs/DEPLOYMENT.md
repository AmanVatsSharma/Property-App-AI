# Deployment

This document describes how to deploy Property-App-AI (KonKreet) for a working MVP with **no mock data**. Use the root [.env.example](../.env.example) as a full-stack reference for all environment variables. For local per-app setup, use each app’s `.env.example`: [apps/api/.env.example](../apps/api/.env.example), [apps/web/.env.example](../apps/web/.env.example) (create from root `.env.example` if not present), [apps/admin/.env.example](../apps/admin/.env.example), [apps/mobile/.env.example](../apps/mobile/.env.example).

## Prerequisites

- Node.js 20+
- PostgreSQL (for API)
- (Optional) Redis — for agent queue when `AGENT_QUEUE_ENABLED=true`
- (Production) SMS provider — Twilio or MSG91 for OTP

## Environment

Copy each app's `.env.example` to `.env` (or `.env.local` for Next.js apps) in that app's directory, or set env in your platform. See per-app paths above.

### API (NestJS)

Production startup **requires:** `NODE_ENV=production`, `JWT_SECRET` (min 16 chars), `CORS_ORIGIN` (explicit origin, not `*`), `SMS_PROVIDER=twilio` or `msg91` with credentials. See [RUNBOOK.md](RUNBOOK.md) for health, logs, and operations.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` for deploy |
| `PORT` | No | Default `3333` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Yes | PostgreSQL connection |
| `JWT_SECRET` | Yes (prod) | Min 16 chars; when unset, auth is skipped |
| `CORS_ORIGIN` | Yes (prod) | Must be explicit origin(s) in production; do not use `*` |
| `DB_POOL_MAX` | No | Connection pool max size (default `20`) |
| `DB_POOL_IDLE_TIMEOUT_MS` | No | Idle timeout in ms (default `30000`) |
| `REQUEST_TIMEOUT_MS` | No | Global request timeout in ms (default `30000`) |
| `SMS_PROVIDER` | Prod | `stub` \| `twilio` \| `msg91` — set to `twilio` or `msg91` with credentials for real OTP |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | If Twilio | For SMS OTP |
| `MSG91_AUTH_KEY` (optional `MSG91_SENDER`) | If MSG91 | For SMS OTP |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | Optional | For agent and area assessment |
| `MAPBOX_ACCESS_TOKEN` | Optional | Geocoding and (when used) area/POI data; see [EXTERNAL_DATA_SOURCES.md](EXTERNAL_DATA_SOURCES.md) |
| `AREA_PROVIDER`, `AREA_ASSESSMENT_TTL_DAYS` | Optional | Area module; see [EXTERNAL_DATA_SOURCES.md](EXTERNAL_DATA_SOURCES.md) |

**Health and metrics:** `GET /health/live` (liveness), `GET /health/ready` (readiness: DB + Redis), `GET /health` (legacy). `GET /metrics` returns Prometheus metrics. Production logs are JSON; include `requestId` where available. Do not log secrets or PII; configure retention per platform.

**Public API:** `GET /api/v1/neighbourhood` is public (no auth). Query params: `locality`, `city`; returns locality scores and assessment. The web app’s neighbourhood page uses this endpoint when `NEXT_PUBLIC_API_URL` (or the GraphQL base URL) is set.

### Web (Next.js)

Set at **build time** (and runtime if using server-side env). Copy [apps/web/.env.example](../apps/web/.env.example) to `apps/web/.env.local` (or create from root `.env.example` if the web app's example is not present):

- `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` — **required** so search and property detail use the real API (no mock). When set, the web neighbourhood page also uses the API via `GET /api/v1/neighbourhood`.

### Admin (Next.js)

Set in `apps/admin/.env.local` (copy from [apps/admin/.env.example](../apps/admin/.env.example)):

- `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` — **required** so the admin dashboard talks to your API.

### Mobile (Expo)

Copy [apps/mobile/.env.example](../apps/mobile/.env.example) to `apps/mobile/.env`:

- `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_GRAPHQL_HTTP` — **required** so the app talks to your API.

## Build and run (local / VM)

1. **Database:** Create PostgreSQL DB and run migrations. **Exact command from repo root:**

   ```bash
   nx run api:migration:run
   ```

   (Requires `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in env. The script loads `apps/api/.env` then root `.env`; see [apps/api/README.md](../apps/api/README.md) § Migrations.) **Run migrations before deploy** so the app starts against the correct schema.

   **Backups:** Use a recommended backup strategy for PostgreSQL (e.g. daily backups, point-in-time recovery where needed). Ensure backups are tested and that migrations are run before deploying new app versions to avoid schema drift.
2. **API:** From repo root: `npm ci && npx nx run api:build && npx nx run api:serve --configuration=production` (or use the Dockerfile below).
3. **Web:** `NEXT_PUBLIC_GRAPHQL_HTTP=<your-api>/graphql npx nx run web:build && npx nx run web:start --configuration=production`.
4. **Admin:** `npm run dev:admin` for development; `npm run build:admin` then serve the output for production (admin dashboard).
5. **Mobile:** Build with EAS or local tooling; set `EXPO_PUBLIC_*` so the app points to your API.

## CI/CD

CI runs on push/PR to `main` and `develop`: lint, build (api + web), madge cycle check, API unit tests with coverage, web unit tests, and a separate **migrations** job that runs `nx run api:migration:run` against a PostgreSQL service container to verify migrations. For CD, deploy the API (and web) after CI passes—e.g. on tag push or after merge to `main`. Use GitHub secrets for any deploy keys; do not log secrets in CI.

## Docker (API only)

A minimal Dockerfile for the API is at the repo root. Build and run:

```bash
docker build -f Dockerfile -t property-api .
docker run -p 3333:3333 --env-file .env property-api
```

Ensure `.env` has `DB_*`, `JWT_SECRET`, and optionally `SMS_PROVIDER` + Twilio/MSG91 vars.

## MVP checklist (no mock data)

Before going live, ensure:

- [ ] **API:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` and `JWT_SECRET` are set; run **migrations** (`nx run api:migration:run` from repo root).
- [ ] **API (production OTP):** `SMS_PROVIDER=twilio` or `SMS_PROVIDER=msg91` with the corresponding credentials (Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`; MSG91: `MSG91_AUTH_KEY`) so OTP is sent in production—not stub or log-only.
- [ ] **Web:** `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` set so search, property detail, landing featured/links, and **neighbourhood** use the real API (no mock). The neighbourhood page calls `GET /api/v1/neighbourhood` via `NeighbourhoodExplorerClient` when the API URL is set.
- [ ] **Admin:** `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` set so the admin dashboard uses the API.
- [ ] **Mobile:** `EXPO_PUBLIC_GRAPHQL_HTTP` or `EXPO_PUBLIC_API_URL` set so the app uses the API.
- [ ] **No mock data:** No mock or placeholder listing, featured, or neighbourhood data in any app; property list, detail, and neighbourhood from API only; landing featured and links API-sourced or fixed; empty/connect-API state when API is unavailable or returns empty. (Landing hero stats and city card counts are illustrative marketing copy, not from the API.)
- [ ] Post listing requires backend URL; agent placeholder tools (e.g. get_price_forecast, check_rera) return "Coming soon".
- [ ] (Optional) Image upload: When `JWT_SECRET` is set, upload endpoints require `Authorization: Bearer <token>`. The web app sends the signed-in user's token when uploading images in post-property; no extra config needed.
