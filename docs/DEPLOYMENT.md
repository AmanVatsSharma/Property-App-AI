# Deployment

This document describes how to deploy Property-App-AI (UrbanNest.ai) for a working MVP with **no mock data**. Use [.env.example](../.env.example) as the source for all environment variables.

## Prerequisites

- Node.js 20+
- PostgreSQL (for API)
- (Optional) Redis — for agent queue when `AGENT_QUEUE_ENABLED=true`
- (Production) SMS provider — Twilio or MSG91 for OTP

## Environment

Copy `.env.example` to `.env` (or set env in your platform) and fill:

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

### Web (Next.js)

Set at **build time** (and runtime if using server-side env):

- `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` — **required** so search and property detail use the real API (no mock).

### Mobile (Expo)

- `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_GRAPHQL_HTTP` — **required** so the app talks to your API.

## Build and run (local / VM)

1. **Database:** Create PostgreSQL DB and run migrations (see API README or `apps/api`).
2. **API:** From repo root: `npm ci && npx nx run api:build && npx nx run api:serve --configuration=production` (or use the Dockerfile below).
3. **Web:** `NEXT_PUBLIC_GRAPHQL_HTTP=<your-api>/graphql npx nx run web:build && npx nx run web:start --configuration=production`.

## Docker (API only)

A minimal Dockerfile for the API is at the repo root. Build and run:

```bash
docker build -f Dockerfile -t property-api .
docker run -p 3333:3333 --env-file .env property-api
```

Ensure `.env` has `DB_*`, `JWT_SECRET`, and optionally `SMS_PROVIDER` + Twilio/MSG91 vars.

## Checklist (no mock data)

- [ ] API: `DB_*` and `JWT_SECRET` set; migrations applied.
- [ ] API: `SMS_PROVIDER=twilio` or `msg91` with credentials so OTP is sent in production.
- [ ] Web: `NEXT_PUBLIC_GRAPHQL_HTTP` or `NEXT_PUBLIC_API_URL` set so search and property detail use the API.
- [ ] Mobile: `EXPO_PUBLIC_GRAPHQL_HTTP` or `EXPO_PUBLIC_API_URL` set.
- [ ] No mock listing or placeholder data is shown: property list and detail come from the API; post listing requires backend URL; agent placeholder tools return "Coming soon".
