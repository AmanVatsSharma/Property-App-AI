# External Data Sources for Property and Region Scoring

This document describes external data requirements for property rating and locality/region assessment, and how to integrate them.

## Data Requirements

### Property / locality scoring

1. **Price indices**
   - **NHB Housing Price Index (HPI):** India Open Government Data (data.gov.in). City-level and some locality trends for under-construction and resale.
   - **MagicBricks PropIndex:** Tracks residential price movements across 500+ localities in Tier-I cities. Demand-weighted methodology.

2. **RERA**
   - State RERA APIs for project registration and status. Already placeholder in agent (`check_rera`); integrate real APIs when keys are available.

3. **POI / connectivity**
   - **Mapbox:** Already used for geocoding (`MAPBOX_ACCESS_TOKEN`). Can use Mapbox Geocoding and optional Places/POI for schools, hospitals, transport proximity to derive connectivity score.
   - **Google Places API:** Alternative for POI density and distance (requires `GOOGLE_PLACES_API_KEY`).

4. **Aggregated market data**
   - Third-party providers (e.g. Liases Foras, or scraping APIs for 99acres, MagicBricks, Housing.com) for locality-level supply/demand and comparable prices. Use for backfill or real-time comparables.

## How to get the data

### APIs (env-based keys)

- `MAPBOX_ACCESS_TOKEN` — already used; extend for POI if needed.
- `RERA_API_KEY` — when integrating state RERA APIs.
- `GOOGLE_PLACES_API_KEY` — optional for Google Places.

### File / ETL

- Bulk CSV or JSON from India OGD (HPI) or PropIndex for initial backfill of area/locality trends.
- Import jobs can populate `area` table or a separate price-index table.

### Provider interface

The Area module defines `AreaDataProvider`: `getAreaData(locality: string, city?: string): Promise<AreaData | null>`. Concrete implementations (e.g. `MapboxAreaProvider`, `OgdBulkProvider`) can be plugged in via config. Set `AREA_PROVIDER=none` for LLM-only assessment; `AREA_PROVIDER=mapbox` when a Mapbox-based provider is implemented.

## Env vars (area and scoring)

| Variable | Description |
|----------|-------------|
| `AREA_ASSESSMENT_TTL_DAYS` | Re-assess area only if older than this (default 30). |
| `AREA_PROVIDER` | `none` (LLM only) or `mapbox` (when implemented). |

When no external provider is configured or it returns no data, the Area assessor falls back to LLM-based assessment (structured output) and sets `dataSource: 'llm'` on the Area entity.
