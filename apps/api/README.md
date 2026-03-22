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

**Dev pipeline:** `api:serve` runs **`api:compile`** in watch mode: **`tsc -p tsconfig.app.json`** then **`tsc-alias`** so `@api/*` resolves in emitted JS under `dist/apps/api`. The dev server runs `dist/apps/api/src/main.js`. For a fast gate without emit, use **`nx run api:typecheck`** (or root `typecheck:api`) — same as CI’s API type step.

**Production / Docker image pipeline:** `api:build` uses **Webpack** with **NxAppWebpackPlugin** (`compiler: 'tsc'`). **Fork-ts-checker is disabled** (`skipTypeChecking: true` in [`webpack.config.js`](webpack.config.js)) to avoid very large memory use; rely on **`api:typecheck`** for full project type safety. Output is bundled with `generatePackageJson` for deployable artifacts.

API: **http://localhost:3333**  
GraphQL playground: **http://localhost:3333/graphql**

Optional one-off compile (no watch): `npm run compile:api` or `nx run api:compile`. **`api:build`** declares Nx `outputs` for `dist/apps/api` so Nx can cache the production bundle when inputs are unchanged.

### Linux: `ENOSPC` / “System limit for number of file watchers reached”

`api:serve` runs **`tsc --watch`** and **`tsc-alias --watch`**. On Linux, each watcher uses **inotify**; the default limit (often ~100k) can be exhausted when the IDE and other tools also watch files.

1. **Already mitigated in repo:** `api:compile:development` sets **`CHOKIDAR_USEPOLLING`** for `tsc-alias` and **`TSC_WATCHFILE=DynamicPriorityPolling`** for TypeScript so dev uses lighter/polling-based watching where supported.
2. **Raise the system limit (recommended on Fedora/Ubuntu):**
   ```bash
   # Current value (optional):
   cat /proc/sys/fs/inotify/max_user_watches
   # Apply until reboot:
   sudo sysctl fs.inotify.max_user_watches=524288
   # Persist after reboot:
   echo 'fs.inotify.max_user_watches=524288' | sudo tee /etc/sysctl.d/99-inotify-watches.conf
   sudo sysctl --system
   ```

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
