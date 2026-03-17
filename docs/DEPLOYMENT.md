# Deployment

This document describes how to deploy Property-App-AI (UrbanNest.ai) for a working MVP with **no mock data**. Use the root [.env.example](../.env.example) as a full-stack reference for all environment variables. For local per-app setup, use each app’s `.env.example`: [apps/api/.env.example](../apps/api/.env.example), [apps/web/.env.example](../apps/web/.env.example) (create from root `.env.example` if not present), [apps/admin/.env.example](../apps/admin/.env.example), [apps/mobile/.env.example](../apps/mobile/.env.example).

## Prerequisites

- Node.js 20+
- PostgreSQL (for API)
- (Optional) Redis — for agent queue when `AGENT_QUEUE_ENABLED=true`
- (Production) SMS provider — Twilio or MSG91 for OTP

## Environment

Copy each app's `.env.example` to `.env` (or `.env.local` for Next.js apps) in that app's directory, or set env in your platform. See per-app paths above.

### API (NestJS)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` for deploy |
| `PORT` | No | Default `3333` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Yes | PostgreSQL connection |
| `JWT_SECRET` | Yes (prod) | Min 16 chars; when unset, auth is skipped |
| `CORS_ORIGIN` | No | Default `*`; set to your web origin in prod |
| `SMS_PROVIDER` | Prod | `stub` \| `twilio` \| `msg91` — set to `twilio` or `msg91` with credentials for real OTP |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | If Twilio | For SMS OTP |
| `MSG91_AUTH_KEY` (optional `MSG91_SENDER`) | If MSG91 | For SMS OTP |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | Optional | For agent and area assessment |
| `MAPBOX_ACCESS_TOKEN` | Optional | Geocoding and (when used) area/POI data; see [EXTERNAL_DATA_SOURCES.md](EXTERNAL_DATA_SOURCES.md) |
| `AREA_PROVIDER`, `AREA_ASSESSMENT_TTL_DAYS` | Optional | Area module; see [EXTERNAL_DATA_SOURCES.md](EXTERNAL_DATA_SOURCES.md) |

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

   (Requires `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in env. The script loads `apps/api/.env` then root `.env`; see [apps/api/README.md](../apps/api/README.md) § Migrations.)
2. **API:** From repo root: `npm ci && npx nx run api:build && npx nx run api:serve --configuration=production` (or use the Dockerfile below).
3. **Web:** `NEXT_PUBLIC_GRAPHQL_HTTP=<your-api>/graphql npx nx run web:build && npx nx run web:start --configuration=production`.
4. **Admin:** `npm run dev:admin` for development; `npm run build:admin` then serve the output for production (admin dashboard).
5. **Mobile:** Build with EAS or local tooling; set `EXPO_PUBLIC_*` so the app points to your API.

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
- [ ] **Web:** `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` set so search, property detail, and landing featured/links use the real API (no mock).
- [ ] **Admin:** `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` set so the admin dashboard uses the API.
- [ ] **Mobile:** `EXPO_PUBLIC_GRAPHQL_HTTP` or `EXPO_PUBLIC_API_URL` set so the app uses the API.
- [ ] **No mock listing or featured data:** No mock or placeholder listing/featured data in any app; property list and detail from API only; landing featured and links API-sourced or fixed; empty state when API is unavailable or returns empty.
- [ ] Post listing requires backend URL; agent placeholder tools return "Coming soon".
- [ ] (Optional) Image upload: When `JWT_SECRET` is set, upload endpoints require `Authorization: Bearer <token>`. The web app sends the signed-in user's token when uploading images in post-property; no extra config needed.
