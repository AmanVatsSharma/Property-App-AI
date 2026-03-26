# Admin Panel

Next.js admin app for KonKreet (property listing). Manages properties and users; access is restricted to users with role `admin` (assigned via `ADMIN_PHONES` on the API). **MVP uses the real API only; no mock or fake data in production.**

## Run

From repo root:

```bash
npm run dev:admin
```

Or with Nx:

```bash
nx run admin:dev
```

Default: [http://localhost:4200](http://localhost:4200) (or the port Nx assigns).

## Build

```bash
npm run build:admin
```

Or:

```bash
nx run admin:build
```

## Environment

Copy `apps/admin/.env.example` to `apps/admin/.env.local` (or set env vars in your environment). See `.env.example` in this directory for the list of variables.

- **NEXT_PUBLIC_GRAPHQL_HTTP** — GraphQL endpoint (e.g. `http://localhost:3333/graphql`).
- **NEXT_PUBLIC_API_URL** — Optional; API base URL. If set, GraphQL URL is derived as `${NEXT_PUBLIC_API_URL}/graphql` when `NEXT_PUBLIC_GRAPHQL_HTTP` is not set.

## Main features

- **Login** — OTP flow at `/login`: enter 10-digit Indian mobile, request OTP, verify. If the phone is in the API env `ADMIN_PHONES`, the user gets role `admin` and is redirected to the dashboard; otherwise "Access denied. Admin only." is shown.
- **Dashboard** — Total properties, total users, recent properties with links to edit. Requires valid admin JWT.
- **Properties** — List (table, pagination), create new, edit, delete. All under `/properties` and protected.
- **Users** — List (table, pagination) with phone, display name, role, created date at `/users`.

All dashboard routes require a valid admin JWT; unauthenticated or non-admin users are redirected to `/login`.
