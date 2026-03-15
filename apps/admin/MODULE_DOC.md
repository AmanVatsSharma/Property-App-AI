# App: admin

**Short:** Next.js admin panel for UrbanNest. Dashboard, properties CRUD, users list; OTP login; access restricted to users with role `admin` (via API `ADMIN_PHONES`).

**Purpose:** Admin panel for UrbanNest: dashboard (stats, recent properties), properties (list, create, edit, delete), users (list with phone, display name, role), and role-gated access. **MVP uses the real API only; no mock or fake data in production.**
 Authentication is OTP-based; only phones listed in the API’s `ADMIN_PHONES` receive the `admin` role and can access dashboard routes.

**Files:**

- **app/** — Next.js App Router: `layout.tsx` (root), `login/page.tsx`, `(dashboard)/layout.tsx` (AdminGuard + sidebar), `(dashboard)/page.tsx` (dashboard home), `(dashboard)/properties/page.tsx`, `(dashboard)/properties/new/page.tsx`, `(dashboard)/properties/[id]/page.tsx`, `(dashboard)/users/page.tsx`.
- **components/** — `AdminGuard.tsx` (token + role check, redirect to login), `Sidebar.tsx` (nav).
- **lib/** — `graphql-client.ts` (GraphQL URL resolution, queries/mutations, `runGraphQL` from `@property-app-ai/shared`), `auth.ts` (token get/set/clear in localStorage).

**Env vars:**

- **NEXT_PUBLIC_GRAPHQL_HTTP** — GraphQL endpoint (e.g. `http://localhost:3333/graphql`). Used by the client; fallback is `${NEXT_PUBLIC_API_URL}/graphql` if set.
- **NEXT_PUBLIC_API_URL** — Optional API base URL; GraphQL URL is derived as `${NEXT_PUBLIC_API_URL}/graphql` when `NEXT_PUBLIC_GRAPHQL_HTTP` is not set.
- **API_GRAPHQL_HTTP** — Optional; used server-side when `NEXT_PUBLIC_GRAPHQL_HTTP` is not set (see `graphql-client.ts`).

Copy `apps/admin/.env.example` to `apps/admin/.env.local` and set values as needed.

**Change-log:**

- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
