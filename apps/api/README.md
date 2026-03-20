# Property-App-AI — NestJS GraphQL API

Backend for UrbanNest.ai: GraphQL (Apollo, code-first) with TypeORM and Postgres.

## Run (local dev)

From **repo root**, install dependencies once (`pnpm install` or `npm install`). The monorepo uses **pnpm** lockfiles; `npm install` at root also works for the same workspace scripts.

```bash
npm run dev:api
# or
pnpm dev:api
# or
nx run api:serve
```

**Dev pipeline:** `api:serve` runs **`api:compile`** with **SWC** (fast transpile, `skipTypeCheck: true`) in watch mode, then starts Node on `dist/apps/api/src/main.js`. Path aliases `@api/*` are resolved at compile time via [`apps/api/.swcrc`](.swcrc). Dev compile does **not** type-check the whole project; rely on the editor, `pnpm exec tsc --noEmit -p apps/api/tsconfig.app.json` when needed (may require a large `NODE_OPTIONS` heap on this codebase), and CI.

**Production / Docker image pipeline:** `api:build` still uses **Webpack** + **`tsc`** (NxAppWebpackPlugin) so you get a bundled output, `generatePackageJson`, and the same type-checking behaviour as before; this target is heavier by design.

API: **http://localhost:3333**  
GraphQL playground: **http://localhost:3333/graphql**

Optional one-off compile (no watch): `npm run compile:api` or `nx run api:compile`.

## Build (production bundle)

```bash
npm run build:api
# or
nx run api:build
```

## Environment

| Variable    | Default    | Description        |
|------------|------------|--------------------|
| `PORT`     | `3333`     | HTTP port          |
| `DB_HOST`  | `localhost`| Postgres host      |
| `DB_PORT`  | `5432`     | Postgres port      |
| `DB_USER`  | `postgres` | Postgres user      |
| `DB_PASSWORD` | `postgres` | Postgres password |
| `DB_NAME`  | `property_app` | Database name  |
| `NODE_ENV` | -          | `production` disables playground and DB sync |
| `LOG_LEVEL`| `debug` (dev) / `info` (prod) | Pino log level |

Copy `apps/api/.env.example` to `apps/api/.env` (or use a root `.env` when running from repo root). The API loads `apps/api/.env` first if present, then falls back to root `.env`. Set env before running. In development, TypeORM `synchronize` is on (schema auto-updated); disable in production and use migrations.

**Local Postgres:** Ensure the database exists. If using host Postgres with ident/peer auth, create it once: `sudo -u postgres createdb property_app`. Or start Postgres via Docker: `docker compose up -d postgres` (from repo root; ensure port 5432 is free or stop host Postgres).

## GraphQL API

- **Query `properties`** — List properties with optional filters: `type`, `location`, `minPrice`, `maxPrice`, `bedrooms`, `limit`, `offset`.
- **Query `property(id)`** — Get one property by ID.
- **Mutation `createProperty(input)`** — Create a property.
- **Mutation `updateProperty(id, input)`** — Update a property.
- **Mutation `deleteProperty(id)`** — Delete a property.

Frontend can point to this API via `NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:3333/graphql` (or the deployed URL).

## Structure

- `src/app/` — Root module, bootstrap.
- `src/modules/property/` — Property feature (entity, DTOs, resolver, service).
- `src/shared/` — Logger (Pino).
- `src/common/` — Errors, exception filter, requestId middleware.

## Migrations

Migrations live in `src/database/migrations/`. Production uses `synchronize: false`; run pending migrations before or after deploy.

**From repo root:**

```bash
nx run api:migration:run
```

**From `apps/api` directory:**

```bash
node -r @swc-node/register src/database/run-migrations.ts
```

Env is loaded in the same order as the app: root `.env` first, then `apps/api/.env` (app overrides). Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` before running.
