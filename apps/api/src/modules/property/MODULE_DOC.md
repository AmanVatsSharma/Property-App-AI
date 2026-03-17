# Module: property

**Short:** Property CRUD and search for UrbanNest.ai.

**Purpose:** Manage property listings: list with filters (type, location, price, bedrooms, **map viewport bounds**, **sortBy**/ **sortOrder**), get by id, create, update, delete. Create requires an authenticated user; the owner’s first listing is marked **isFreeListing** = true, subsequent listings false. Geocoding (Mapbox) fills **latitude**/ **longitude** when not provided on create/update. **Area resolution** (AreaService.getOrCreate) sets **areaId**, **locality**, **city** from reverse geocode or geocode context for listing enrichment and area-based search. Aligns with frontend search/detail and post-property flows.

**Files:**
- `property.module.ts` — Nest module; registers entity, repository, GeocodingService, PropertyService, PropertyResolver; imports AreaModule.
- `resolvers/property.resolver.ts` — GraphQL queries and mutations; passes `ctx.req.user.sub` into create.
- `services/property.service.ts` — Business logic; auth check and **isFreeListing** on create; calls GeocodingService when lat/lng missing; resolves **areaId**/locality/city via AreaService after geocoding.
- `services/geocoding.service.ts` — Mapbox Geocoding API; address → lat/lng (and optional locality/city from context); **reverseGeocode(lat, lng)** for locality/city.
- `services/nearby.service.ts` — Mapbox proximity search for nearby POIs (metro, school, hospital); returns **nearbyAmenities** strings (e.g. "metro:1.2km"); used on create/update when lat/lng present.
- `repository/property.repository.ts` — TypeORM data access; **findAllWithFilters** (bounds, **sortBy**/ **sortOrder**), create ( **createdByUserId**, **isFreeListing**), update, delete, **countByUserId**.
- `dtos/create-property.dto.ts` — Create input (title, location, lat/lng optional, price, type, bedrooms, bathrooms, areaSqft, status, listingFor, specs, aiTip, aiScore, **coverImageUrl**, **imageUrls**).
- `dtos/update-property.dto.ts` — Update input (all fields optional, same shape as create).
- `dtos/property-filter.dto.ts` — List filter: type, location, **minLat**, **maxLat**, **minLng**, **maxLng**, minPrice, maxPrice, bedrooms, **schoolsScoreMin**, **connectivityScoreMin** (area-based; for "near school"/"near metro"), **sortBy** (createdAt | price | aiScore), **sortOrder** (asc | desc), limit, offset.
- `controllers/search.controller.ts` — REST **POST /api/v1/search** (body: `{ query: string }`); parses NL via SearchParserService, returns properties.
- `entities/property.entity.ts` — Property entity (id, title, location, **areaId**, **locality**, **city**, latitude, longitude, price, type, bedrooms, bathrooms, areaSqft, status, listingFor, specs, aiTip, aiScore, **coverImageUrl**, **imageUrls**, **createdByUserId**, **isFreeListing**, createdAt, updatedAt).
- `__tests__/property.service.spec.ts` — Unit tests.
- `MODULE_DOC.md` — this file.

**Dependencies:** TypeORM (Postgres), GraphQL (Apollo code-first), **LoggerService** (shared), **ConfigService** (Nest) for Mapbox token.

**APIs (GraphQL):**
- **Query `properties(filter?)`** — List properties. Filter: type, location, price range, bedrooms, **schoolsScoreMin**, **connectivityScoreMin** (area scores), map viewport bounds, **sortBy**, **sortOrder**, limit, offset.
- **Query `searchPropertiesByQuery(query: string)`** — One-shot NL search: parses query (e.g. "3 BHK near school near metro in Bangalore") via SearchParserService, returns properties.
- **Query `property(id)`** — Get one by id.
- **Mutation `createProperty(input)`** — Create listing; requires authenticated user; sets **createdByUserId** from JWT and **isFreeListing** (true for owner’s first listing, false otherwise); geocodes when lat/lng omitted.
- **Mutation `updateProperty(id, input)`** — Update listing; geocodes when location changed and lat/lng omitted.
- **Mutation `deleteProperty(id)`** — Delete by id.

**Env vars:** Root **DB_*** (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). Optional **MAPBOX_ACCESS_TOKEN** for server-side geocoding on create/update when client does not send coordinates.

**Flow:** List → resolver `properties(filter)` → PropertyService.findAll(filter) → PropertyRepository.findAllWithFilters(filter) (bounds, sort, pagination). Create → resolver `createProperty(input)` with user from context → PropertyService.create (auth required, isFreeListing from countByUserId, geocode if needed) → PropertyRepository.create. Get/Update/Delete → service findOne/update/remove → repository findById/update/delete.

**Entity fields:** **id**, **title**, **location**, **areaId**, **locality**, **city**, **latitude**, **longitude**, **price**, **type**, **bedrooms**, **bathrooms**, **areaSqft**, **status**, **listingFor**, **specs**, **aiTip**, **aiScore**, **coverImageUrl**, **imageUrls**, **nearbyAmenities** (JSONB array e.g. ["metro:1.2km", "school:800m"]; set from NearbyService on create/update when lat/lng present), **createdByUserId**, **isFreeListing**, **createdAt**, **updatedAt**. Optional future: **description**, AI listing analyser (title/description → BHK, type, specs), image analyser (vision tags).

**Error codes:** **PROPERTY_NOT_FOUND** (404), **VALIDATION_ERROR** (400). Unauthenticated create → **UnauthorizedException**. See `common/errors`; GraphQL errors may include `extensions.code` and `extensions.statusCode`.

**Change-log:**
- 2026-03-17: Search by area: **PropertyFilterDto** extended with **schoolsScoreMin**, **connectivityScoreMin**; repository inner-joins Area when these filters set. Agent **search_properties** tool and domain prompt: pass schools_score_min/connectivity_score_min for "near school"/"near metro". **NL search:** SearchModule (SearchParserService + prompt), **POST /api/v1/search** (SearchController), **GraphQL searchPropertiesByQuery(query)**. PropertyModule imports SearchModule.
- 2026-03-17: Listing enrichment: **nearbyAmenities** (JSONB) and migration AddPropertyNearbyAmenities; **NearbyService** (Mapbox proximity search for metro, school, hospital) populates on create/update when lat/lng present. Optional AI text/image analysis documented as future work.
- 2026-03-17: Property–area link: added **areaId**, **locality**, **city** to entity and DTOs; migration AddPropertyAreaLink. PropertyService resolves area on create/update (GeocodingService reverseGeocode or geocode context → AreaService.getOrCreate). GeocodingService: **reverseGeocode(lat, lng)** and locality/city in **GeocodeResult** for area resolution.
- 2026-03-15: MVP readiness: confirmed no mock data; list, detail, and create use DB only; filter/shape aligned with web.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2026-03-14: Search robustness: added **sortBy**/ **sortOrder** in PropertyFilterDto and repository-level sorting (createdAt/price/aiScore) with existing pagination support. Listing robustness: createProperty now requires authenticated user and marks the owner's first listing as **isFreeListing** = true (subsequent listings false), plus migration AddPropertyIsFreeListing.
- 2025-03-13: Property-to-maps: added latitude/longitude (nullable) to entity and DTOs; migration AddPropertyLatLng. GeocodingService (Mapbox) geocodes address when lat/lng not provided on create/update. PropertyFilterDto and repository support map viewport bounds (minLat, maxLat, minLng, maxLng). Env: MAPBOX_ACCESS_TOKEN optional.
- 2025-03-12: Added createdByUserId to entity and repository; createProperty resolver passes ctx.req.user.sub so listings are owned by signed-in user when JWT is set.
- 2025-03-12: Added coverImageUrl and imageUrls to entity, DTOs, and repository; migration AddPropertyImageUrls. Images uploaded via storage module (S3) and passed to createProperty/updateProperty.
- 2025-03-10: Enterprise refactor: strict layout (resolvers/, services/, dtos/, repository/), repository layer, LoggerService entry/exit, unit tests, MODULE_DOC and error codes.
- 2025-03-10: Initial scaffold (entity, DTOs, resolver, service, module).
