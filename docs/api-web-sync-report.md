# Backend API surface and frontend usage

**Date:** 2026-05-07 (refreshed; previous snapshot 2026-03-17)

> **Note (2026-05-07):** Earlier sync reports listed several "no UI calling X"
> gaps that have since shipped — `setUserRole` in `AdminClient.tsx`,
> `updateMyProfile` in `app/profile/ProfileClient.tsx`, NL search via
> `searchPropertiesByQuery` on both web (`SearchPageClient`) and mobile
> (`(tabs)/search.tsx`). Those rows are removed below. Genuine remaining
> gaps live in section 3.

## 1. Backend API surface

### GraphQL (`/graphql`)

| Module  | Operation        | Type     | Description                    |
|---------|------------------|----------|--------------------------------|
| Auth    | sendOtp, verifyOtp | Mutation | OTP (public)                   |
| User    | me, updateMyProfile | Query/Mutation | Current user, update profile |
| Property| properties, property, createProperty, updateProperty, deleteProperty | Query/Mutation | List, get, CRUD |
| Agent   | askAgent, agentJobStatus, scoreProperty | Mutation/Query | Agent, async job, score |
| Admin   | users, adminStats, setUserRole | Query/Mutation | Users list, stats, set role |

### REST

| Method | Path                    | Description        |
|--------|-------------------------|--------------------|
| GET    | `/`, `/health`          | Root, health       |
| GET    | `/api/v1/neighbourhood` | Area scores        |
| POST   | `/api/v1/upload`        | Single file upload |
| POST   | `/api/v1/upload-multiple` | Multiple files  |

## 2. Frontend usage

- **Web:** GraphQL via `graphql-client.ts` (NEXT_PUBLIC_GRAPHQL_HTTP / NEXT_PUBLIC_API_URL). Uses: sendOtp, verifyOtp, me, properties, property, createProperty, askAgent, agentJobStatus; REST upload via `upload-api.ts`. **REST GET /api/v1/neighbourhood** is called by `NeighbourhoodExplorerClient` via `apiGet` (when `NEXT_PUBLIC_API_URL` or GraphQL base URL is set); locality/city from URL or form, loading and error states, no mock data.
- **Admin:** Same GraphQL + adminStats, users, **setUserRole** (`AdminClient.tsx` row action; AdminGuard server-side).
- **Mobile:** GraphQL for auth, properties, property, createProperty, **searchPropertiesByQuery** (NL search wired in `(tabs)/search.tsx`). No REST upload or neighbourhood yet.
- **Compare:** New `/compare` route (server component) reads `?ids=...`, fetches via `gqlProperty` in parallel, renders `CompareClient` with side-by-side metrics, AI-verdict button (`gqlAskAgent` → agent's `compare_properties` tool).

## 3. Backend APIs not called by frontend

| API                              | Notes                                                                 |
|----------------------------------|-----------------------------------------------------------------------|
| **scoreProperty**                | Only invoked indirectly via the agent's `score_property` tool; no dedicated UI button. (Agent surfaces it in the AI Fab.) |
| **POST /api/v1/upload-multiple** | Only single-file upload used (`upload-api.ts` calls `/upload`). Multi-file reserved for future bulk-photo flow on PostProperty form. |
