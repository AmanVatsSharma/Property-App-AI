# Property-App-AI — NestJS GraphQL API

Backend for UrbanNest.ai: GraphQL (Apollo, code-first) with TypeORM and Postgres.

## Run

From **repo root**:

```bash
npm run dev:api
```

Or: `nx run api:serve`.

API: **http://localhost:3333**  
GraphQL playground: **http://localhost:3333/graphql**

## Build

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

Create a `.env` in the repo root or set env before running. In development, TypeORM `synchronize` is on (schema auto-updated); disable in production and use migrations.

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

For production, turn off `synchronize` and use TypeORM migrations. Add a script in `package.json` to run migrations (e.g. `typeorm migration:run`) and add migration files under `src/migrations/` when schema changes.
