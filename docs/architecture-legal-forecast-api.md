# Legal-Checker & Price-Forecast — Proposed API Surface

**Status:** Proposal (doc only; no implementation).  
**Purpose:** Define minimal API surface so the web **legal-checker** and **price-forecast** pages can call dedicated endpoints and show "Coming soon" vs real results consistently.

---

## 1. Current state (inspection)

- **Agent tools** (`apps/api/src/modules/agent/services/agent-tools.service.ts`):
  - **check_rera** (`checkReraImpl`): input `{ project_name_or_number }` → returns string *"RERA verification is coming soon. Real-time RERA API integration will be available in a future update."*
  - **get_price_forecast** (`getPriceForecastImpl`): input `{ locality, city?, horizon_months? }` (default 24) → returns string *"Price forecast for localities is coming soon. This feature will use demand and infrastructure data in a future update."*

- **Web pages:**
  - **Legal-checker** (`apps/web/src/app/legal-checker/page.tsx`): RERA project search (project name or RERA registration number) + document checklist (sale deed, title, NOC). No API calls yet; UI is static.
  - **Price-forecast** (`apps/web/src/app/price-forecast/page.tsx`): City, Locality, Horizon (12/24/36 months); expects a result block with current price and 12/24/36 month price + gain %. Static mock data in UI.

---

## 2. Proposed API surface

### 2.1 Legal-checker (RERA)

**Option A — REST (recommended for transactional check):**

| Aspect | Proposal |
|--------|----------|
| **Method / Path** | `POST /api/v1/legal/check-rera` |
| **Body** | `{ "projectNameOrNumber": string }` (required; validated via DTO) |
| **Response (current — coming soon)** | `{ "status": "coming_soon", "message": "RERA verification is coming soon. Real-time RERA API integration will be available in a future update." }` |
| **Response (future — real)** | `{ "status": "ok", "projectName": string, "reraNumber": string | null, "registered": boolean, "state": string | null, "details": object | null }` (or equivalent from RERA API) |
| **Auth** | Public or optional auth (TBD); no secrets in response. |
| **Content-Type** | `application/json` |

**Option B — GraphQL:**

- Query e.g. `checkRera(input: CheckReraInput!): CheckReraResult!`
- `CheckReraInput`: `{ projectNameOrNumber: String! }`
- `CheckReraResult`: union or type with `status: "coming_soon" | "ok"`, and either `message` (when coming_soon) or `projectName`, `reraNumber`, `registered`, etc. (when ok).

**Recommendation:** REST `POST /api/v1/legal/check-rera` for a single, transactional check; keeps parity with agent tool input. Frontend can call it from the "Search" button and branch on `status === "coming_soon"` to show a coming-soon message and CTA.

---

### 2.2 Price-forecast

**Option A — REST (recommended for read-only, cacheable):**

| Aspect | Proposal |
|--------|----------|
| **Method / Path** | `GET /api/v1/forecast` |
| **Query params** | `locality` (required), `city` (optional), `horizonMonths` (optional, default 24; 12 \| 24 \| 36) |
| **Response (current — coming soon)** | `{ "status": "coming_soon", "message": "Price forecast for localities is coming soon. This feature will use demand and infrastructure data in a future update." }` |
| **Response (future — real)** | e.g. `{ "status": "ok", "locality": string, "city": string | null, "horizonMonths": number, "currentPricePerSqft": number | null, "forecasts": [ { "months": 12, "pricePerSqft": number, "gainPercent": number }, ... ] }` (shape to be aligned with ML/data source) |
| **Auth** | Public or optional auth (TBD). |
| **Content-Type** | `application/json` |

**Option B — GraphQL:**

- Query e.g. `getPriceForecast(locality: String!, city: String, horizonMonths: Int): PriceForecastResult!`
- `PriceForecastResult`: type with `status: "coming_soon" | "ok"`, and either `message` (when coming_soon) or `locality`, `city`, `horizonMonths`, `forecasts` (when ok).

**Recommendation:** REST `GET /api/v1/forecast?locality=...&city=...&horizonMonths=24` for clarity and cacheability. Frontend can branch on `status === "coming_soon"` to show coming-soon UI; when real implementation exists, same endpoint returns the forecast payload.

---

## 3. "Coming soon" vs real implementation

- **Coming soon:** API returns HTTP 200 with body `{ "status": "coming_soon", "message": "<human-readable text>" }`. No real RERA or forecast data. Frontend should show a clear “Coming soon” state (e.g. message + CTA), not mock data.
- **Real implementation:** API returns HTTP 200 with `status: "ok"` and the real payload. Frontend shows actual RERA result or forecast grid (current + 12/24/36 month price and gain %).
- **Errors:** Use standard error responses (4xx/5xx and existing exception filter); do not use `status: "coming_soon"` for failure cases (e.g. validation or server errors).

---

## 4. Modules and placement

- **Legal:** New module e.g. `apps/api/src/modules/legal/` with a controller exposing `POST /api/v1/legal/check-rera`, delegating to a small service that (for now) returns the coming_soon payload; later the same service can call RERA provider.
- **Forecast:** New module e.g. `apps/api/src/modules/forecast/` with a controller exposing `GET /api/v1/forecast`, delegating to a service that (for now) returns coming_soon; later integrates ML or external data.
- **Agent:** Existing agent tools `check_rera` and `get_price_forecast` can remain as-is (returning string messages). When legal/forecast modules are implemented, the agent can optionally call the same services for consistent behaviour, or keep tool responses as narrative only.

---

## 5. Environment and config

- No new env vars for the **coming soon** implementation.
- **Future:** RERA integration may require e.g. `RERA_API_URL`, `RERA_API_KEY`; forecast may require model endpoint or data source config. To be defined when implementing.

---

## 6. Summary

| Feature | Proposed endpoint | Current behaviour | Future behaviour |
|--------|--------------------|-------------------|-------------------|
| Legal (RERA) | `POST /api/v1/legal/check-rera` with `{ projectNameOrNumber }` | `{ status: "coming_soon", message }` | `{ status: "ok", projectName, reraNumber, registered, ... }` |
| Price forecast | `GET /api/v1/forecast?locality=...&city=...&horizonMonths=24` | `{ status: "coming_soon", message }` | `{ status: "ok", locality, city, horizonMonths, forecasts: [...] }` |

Frontend: call these endpoints from legal-checker and price-forecast pages; if `status === "coming_soon"`, show coming-soon UI; otherwise render real data. No implementation in this doc — backend and frontend to implement against this contract.
