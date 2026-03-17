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

- **Web:** GraphQL via `graphql-client.ts` (NEXT_PUBLIC_GRAPHQL_HTTP / NEXT_PUBLIC_API_URL). Uses: sendOtp, verifyOtp, me, properties, property, createProperty, askAgent, agentJobStatus; REST upload via `upload-api.ts`.
- **Admin:** Same GraphQL + adminStats, users; no setUserRole UI.
- **Mobile:** GraphQL for auth, properties, property, createProperty; no REST upload or neighbourhood.

## 3. Backend APIs not called by frontend

| API                          | Notes                                                                 |
|-----------------------------|-----------------------------------------------------------------------|
| **GET /api/v1/neighbourhood** | Web/mobile neighbourhood pages use static data; no fetch to this API. |
| **POST /api/v1/upload-multiple** | Only single-file upload used.                                        |
| **updateMyProfile**         | No profile/settings screen calling it.                               |
| **scoreProperty**           | Only agent tools use it; no direct UI.                               |
| **setUserRole**             | No admin UI for it.                                                  |
