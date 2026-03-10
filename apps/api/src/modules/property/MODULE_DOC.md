# Module: property

**Short:** Property CRUD and search for UrbanNest.ai.

**Purpose:** Manage property listings: list with filters, get by id, create, update, delete. Aligns with frontend search/detail and post-property flows.

**Files:**
- property.module.ts — Nest module
- property.resolver.ts — GraphQL queries and mutations
- property.service.ts — Business logic
- dto/ — create, update, filter DTOs
- entities/ — Property entity (TypeORM)
- MODULE_DOC.md — this file

**Dependencies:** TypeORM (Postgres), GraphQL (Apollo code-first).

**APIs (GraphQL):**
- `properties(filter?)` — query: list properties with optional type, location, price range, bedrooms, limit, offset
- `property(id)` — query: get one by id
- `createProperty(input)` — mutation
- `updateProperty(id, input)` — mutation
- `deleteProperty(id)` — mutation

**Env vars:** Uses root DB_* (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME).

**Change-log:**
- 2025-03-10: Initial scaffold (entity, DTOs, resolver, service, module).
