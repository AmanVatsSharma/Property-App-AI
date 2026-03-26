# Property-App-AI — NestJS GraphQL API

Backend for KonKreet: GraphQL (Apollo, code-first) with TypeORM and Postgres.

## Run (local dev)

From **repo root**, install dependencies once (`pnpm install` or `npm install`). The monorepo uses **pnpm** lockfiles; `npm install` at root also works for the same workspace scripts.

```bash
npm run dev:api
# or
pnpm dev:api
# or
nx run api:serve
```

**Dev pipeline:** `api:serve` runs **three processes in parallel**: **`tsc --watch`**, **`tsc-alias --watch`**, and **`node --watch`** on `dist/apps/api/src/main.js` (after `main.js` exists, a one-off **`tsc-alias`** runs so path aliases are rewritten before the first boot). This replaces `@nx/js:node` + `api:compile:watch`, because Nx’s node executor waits for `nx:run-commands` watch tasks to **exit** (they never do), so the API process never started. Webpack’s dev server for this app is available as **`nx run api:webpack-serve`** if you need it (`serveTargetName` in root `nx.json`). For a fast gate without emit, use **`nx run api:typecheck`** (or root `typecheck:api`) — same as CI’s API type step.

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
| `DB_PORT`  | `5433` (Podman dev) / `5432` (Compose) | Postgres port      |
| `DB_USER`  | `postgres` | Postgres user      |
| `DB_PASSWORD` | `postgres` | Postgres password |
| `DB_NAME`  | `property_app` | Database name  |
| `NODE_ENV` | -          | `production` disables playground and DB sync |
| `LOG_LEVEL`| `debug` (dev) / `info` (prod) | Pino log level |

Copy `apps/api/.env.example` to `apps/api/.env` (or use a root `.env` when running from repo root). The API loads `apps/api/.env` first if present, then falls back to root `.env`. Set env before running. In development, TypeORM `synchronize` is on (schema auto-updated); disable in production and use migrations.

**Local PostgreSQL (one DB for this app):** On many Linux installs, Postgres on **:5432** uses **ident** for TCP, so the API (user + password over TCP) cannot connect. Use **one** dev database in Podman on **5433** (does not fight with host :5432):

```bash
podman run -d --name property-app-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=property_app \
  -p 5433:5432 \
  --restart unless-stopped \
  docker.io/library/postgres:16-alpine
```

Set **`DB_HOST=localhost`**, **`DB_PORT=5433`**, **`DB_USER=postgres`**, **`DB_PASSWORD=postgres`**, **`DB_NAME=property_app`** (see `apps/api/.env.example`). After first start, run migrations: `nx run api:migration:run`.

**Docker Compose:** `docker compose up -d postgres` publishes **:5432** — use **`DB_PORT=5432`** only when that service owns the port (stop host Postgres or avoid the Podman mapping above).

**Host Postgres + peer:** You can create `property_app` with `psql` over the Unix socket, but the Nest app still needs **scram/trust for 127.0.0.1** in `pg_hba.conf` for TCP, or use the container instead.

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
