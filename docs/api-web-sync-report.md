# Backend API surface and frontend usage

**Date:** 2026-03-17

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
- **Admin:** Same GraphQL + adminStats, users; no setUserRole UI.
- **Mobile:** GraphQL for auth, properties, property, createProperty; no REST upload or neighbourhood.

## 3. Backend APIs not called by frontend

| API                          | Notes                                                                 |
|-----------------------------|-----------------------------------------------------------------------|
| **setUserRole**             | No admin UI for it.                                                   |
| **scoreProperty**           | Only agent tools use it; no direct UI.                                |
| **updateMyProfile**         | No profile/settings screen calling it.                                |
| **POST /api/v1/upload-multiple** | Only single-file upload used.                                        |
