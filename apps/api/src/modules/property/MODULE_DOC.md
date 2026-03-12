# Module: property

**Short:** Property CRUD and search for UrbanNest.ai.

**Purpose:** Manage property listings: list with filters, get by id, create, update, delete. Aligns with frontend search/detail and post-property flows.

**Files:**
- property.module.ts — Nest module
- resolvers/property.resolver.ts — GraphQL queries and mutations
- services/property.service.ts — Business logic; calls GeocodingService when lat/lng missing
- services/geocoding.service.ts — Mapbox Geocoding API; address → lat/lng
- repository/property.repository.ts — Data access (TypeORM); supports bounds filter for map viewport
- dtos/ — create, update, filter DTOs (filter includes minLat, maxLat, minLng, maxLng)
- entities/ — Property entity (TypeORM) with latitude, longitude
- __tests__/property.service.spec.ts — Unit tests
- MODULE_DOC.md — this file

**Dependencies:** TypeORM (Postgres), GraphQL (Apollo code-first), LoggerService (shared).

**APIs (GraphQL):**
- `properties(filter?)` — query: list properties with optional type, location, price range, bedrooms, **map viewport bounds (minLat, maxLat, minLng, maxLng)**, limit, offset
- `property(id)` — query: get one by id
- `createProperty(input)` — mutation
- `updateProperty(id, input)` — mutation
- `deleteProperty(id)` — mutation

**Entity fields:** Includes `latitude` and `longitude` (decimal, nullable) for map display; when not provided by client, server geocodes `location` via Mapbox (if `MAPBOX_ACCESS_TOKEN` is set). Also `coverImageUrl` (single cover image URL) and `imageUrls` (JSONB array of gallery URLs) for S3-backed images; `createdByUserId` (UUID, nullable) links listing to User when created via createProperty (resolver passes req.user.sub). Frontend uploads via REST `/api/v1/upload` then passes URLs in create/update input.

**Error codes:** See `common/errors/errors.constants.ts`. PROPERTY_NOT_FOUND (404), VALIDATION_ERROR (400). GraphQL errors may include `extensions.code` and `extensions.statusCode`.

**Env vars:** Uses root DB_* (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). Optional `MAPBOX_ACCESS_TOKEN` for server-side geocoding (address → lat/lng) on create/update when client does not send coordinates.

**Change-log:**
- 2025-03-13: Property-to-maps: added latitude/longitude (nullable) to entity and DTOs; migration AddPropertyLatLng. GeocodingService (Mapbox) geocodes address when lat/lng not provided on create/update. PropertyFilterDto and repository support map viewport bounds (minLat, maxLat, minLng, maxLng). Env: MAPBOX_ACCESS_TOKEN optional.
- 2025-03-12: Added createdByUserId to entity and repository; createProperty resolver passes ctx.req.user.sub so listings are owned by signed-in user when JWT is set.
- 2025-03-12: Added coverImageUrl and imageUrls to entity, DTOs, and repository; migration AddPropertyImageUrls. Images uploaded via storage module (S3) and passed to createProperty/updateProperty.
- 2025-03-10: Enterprise refactor: strict layout (resolvers/, services/, dtos/, repository/), repository layer, LoggerService entry/exit, unit tests, MODULE_DOC and error codes.
- 2025-03-10: Initial scaffold (entity, DTOs, resolver, service, module).
