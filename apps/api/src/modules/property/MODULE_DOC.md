# Module: property

**Short:** Property CRUD and search for UrbanNest.ai.

**Purpose:** Manage property listings: list with filters (type, location, price, bedrooms, **map viewport bounds**, **sortBy**/ **sortOrder**), get by id, create, update, delete. Create requires an authenticated user; the owner’s first listing is marked **isFreeListing** = true, subsequent listings false. Geocoding (Mapbox) fills **latitude**/ **longitude** when not provided on create/update. Aligns with frontend search/detail and post-property flows.

**Files:**
- `property.module.ts` — Nest module; registers entity, repository, GeocodingService, PropertyService, PropertyResolver.
- `resolvers/property.resolver.ts` — GraphQL queries and mutations; passes `ctx.req.user.sub` into create.
- `services/property.service.ts` — Business logic; auth check and **isFreeListing** on create; calls GeocodingService when lat/lng missing.
- `services/geocoding.service.ts` — Mapbox Geocoding API; address → lat/lng; optional when **MAPBOX_ACCESS_TOKEN** set.
- `repository/property.repository.ts` — TypeORM data access; **findAllWithFilters** (bounds, **sortBy**/ **sortOrder**), create ( **createdByUserId**, **isFreeListing**), update, delete, **countByUserId**.
- `dtos/create-property.dto.ts` — Create input (title, location, lat/lng optional, price, type, bedrooms, bathrooms, areaSqft, status, listingFor, specs, aiTip, aiScore, **coverImageUrl**, **imageUrls**).
- `dtos/update-property.dto.ts` — Update input (all fields optional, same shape as create).
- `dtos/property-filter.dto.ts` — List filter: type, location, **minLat**, **maxLat**, **minLng**, **maxLng**, minPrice, maxPrice, bedrooms, **sortBy** (createdAt | price | aiScore), **sortOrder** (asc | desc), limit, offset.
- `entities/property.entity.ts` — Property entity (id, title, location, latitude, longitude, price, type, bedrooms, bathrooms, areaSqft, status, listingFor, specs, aiTip, aiScore, **coverImageUrl**, **imageUrls**, **createdByUserId**, **isFreeListing**, createdAt, updatedAt).
- `__tests__/property.service.spec.ts` — Unit tests.
- `MODULE_DOC.md` — this file.

**Dependencies:** TypeORM (Postgres), GraphQL (Apollo code-first), **LoggerService** (shared), **ConfigService** (Nest) for Mapbox token.

**APIs (GraphQL):**
- **Query `properties(filter?)`** — List properties. Filter: type, location, price range (minPrice, maxPrice), bedrooms, **map viewport bounds** ( **minLat**, **maxLat**, **minLng**, **maxLng**), **sortBy** (createdAt | price | aiScore), **sortOrder** (asc | desc), limit (default 20), offset (default 0).
- **Query `property(id)`** — Get one by id.
- **Mutation `createProperty(input)`** — Create listing; requires authenticated user; sets **createdByUserId** from JWT and **isFreeListing** (true for owner’s first listing, false otherwise); geocodes when lat/lng omitted.
- **Mutation `updateProperty(id, input)`** — Update listing; geocodes when location changed and lat/lng omitted.
- **Mutation `deleteProperty(id)`** — Delete by id.

**Env vars:** Root **DB_*** (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). Optional **MAPBOX_ACCESS_TOKEN** for server-side geocoding on create/update when client does not send coordinates.

**Flow:** List → resolver `properties(filter)` → PropertyService.findAll(filter) → PropertyRepository.findAllWithFilters(filter) (bounds, sort, pagination). Create → resolver `createProperty(input)` with user from context → PropertyService.create (auth required, isFreeListing from countByUserId, geocode if needed) → PropertyRepository.create. Get/Update/Delete → service findOne/update/remove → repository findById/update/delete.

**Entity fields:** **id** (UUID), **title**, **location**, **latitude**, **longitude** (decimal, nullable; for map display; filled by geocoding when missing), **price**, **type**, **bedrooms**, **bathrooms**, **areaSqft**, **status**, **listingFor**, **specs**, **aiTip**, **aiScore**, **coverImageUrl** (single cover URL), **imageUrls** (JSONB array of gallery URLs), **createdByUserId** (UUID, nullable; set on create from JWT), **isFreeListing** (boolean, default true; first listing per user true, subsequent false), **createdAt**, **updatedAt**. Images uploaded via storage module (e.g. REST `/api/v1/upload`) then URLs passed in create/update input.

**Error codes:** **PROPERTY_NOT_FOUND** (404), **VALIDATION_ERROR** (400). Unauthenticated create → **UnauthorizedException**. See `common/errors`; GraphQL errors may include `extensions.code` and `extensions.statusCode`.

**Change-log:**
- 2026-03-15: MVP readiness: confirmed no mock data; list, detail, and create use DB only; filter/shape aligned with web.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2026-03-14: Search robustness: added **sortBy**/ **sortOrder** in PropertyFilterDto and repository-level sorting (createdAt/price/aiScore) with existing pagination support. Listing robustness: createProperty now requires authenticated user and marks the owner's first listing as **isFreeListing** = true (subsequent listings false), plus migration AddPropertyIsFreeListing.
- 2025-03-13: Property-to-maps: added latitude/longitude (nullable) to entity and DTOs; migration AddPropertyLatLng. GeocodingService (Mapbox) geocodes address when lat/lng not provided on create/update. PropertyFilterDto and repository support map viewport bounds (minLat, maxLat, minLng, maxLng). Env: MAPBOX_ACCESS_TOKEN optional.
- 2025-03-12: Added createdByUserId to entity and repository; createProperty resolver passes ctx.req.user.sub so listings are owned by signed-in user when JWT is set.
- 2025-03-12: Added coverImageUrl and imageUrls to entity, DTOs, and repository; migration AddPropertyImageUrls. Images uploaded via storage module (S3) and passed to createProperty/updateProperty.
- 2025-03-10: Enterprise refactor: strict layout (resolvers/, services/, dtos/, repository/), repository layer, LoggerService entry/exit, unit tests, MODULE_DOC and error codes.
- 2025-03-10: Initial scaffold (entity, DTOs, resolver, service, module).
