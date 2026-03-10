# Module: property

**Short:** Property CRUD and search for UrbanNest.ai.

**Purpose:** Manage property listings: list with filters, get by id, create, update, delete. Aligns with frontend search/detail and post-property flows.

**Files:**
- property.module.ts — Nest module
- resolvers/property.resolver.ts — GraphQL queries and mutations
- services/property.service.ts — Business logic
- repository/property.repository.ts — Data access (TypeORM)
- dtos/ — create, update, filter DTOs
- entities/ — Property entity (TypeORM)
- __tests__/property.service.spec.ts — Unit tests
- MODULE_DOC.md — this file

**Dependencies:** TypeORM (Postgres), GraphQL (Apollo code-first), LoggerService (shared).

**APIs (GraphQL):**
- `properties(filter?)` — query: list properties with optional type, location, price range, bedrooms, limit, offset
- `property(id)` — query: get one by id
- `createProperty(input)` — mutation
- `updateProperty(id, input)` — mutation
- `deleteProperty(id)` — mutation

**Error codes:** See `common/errors/errors.constants.ts`. PROPERTY_NOT_FOUND (404), VALIDATION_ERROR (400). GraphQL errors may include `extensions.code` and `extensions.statusCode`.

**Env vars:** Uses root DB_* (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).

**Change-log:**
- 2025-03-10: Enterprise refactor: strict layout (resolvers/, services/, dtos/, repository/), repository layer, LoggerService entry/exit, unit tests, MODULE_DOC and error codes.
- 2025-03-10: Initial scaffold (entity, DTOs, resolver, service, module).
