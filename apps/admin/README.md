# Admin Panel

Next.js admin app for the property listing SaaS. Manages properties and users; access is restricted to users with role `admin` (assigned via `ADMIN_PHONES` on the API).

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
# or
nx run admin:build
```

## Environment

Create `.env.local` in `apps/admin` (or set env vars):

- `NEXT_PUBLIC_GRAPHQL_HTTP` — GraphQL endpoint (e.g. `http://localhost:3333/graphql`)
- Or `NEXT_PUBLIC_API_URL` — API base URL; GraphQL is `${NEXT_PUBLIC_API_URL}/graphql`

## Login

1. Open `/login`.
2. Enter a 10-digit Indian mobile number and request OTP.
3. Enter the 6-digit code.
4. If the phone is listed in the API env `ADMIN_PHONES` (comma-separated), the user gets role `admin` and is redirected to the dashboard. Otherwise, "Access denied. Admin only." is shown.

Ensure the API has `ADMIN_PHONES` set (e.g. `ADMIN_PHONES=9876543210`) and that OTP is sent (in-memory OTP in dev or configured provider).

## Features

- **Dashboard:** Total properties, total users, recent properties with links to edit.
- **Properties:** List (table, pagination), create new, edit, delete.
- **Users:** List (table, pagination) with phone, display name, role, created date.

All dashboard routes require a valid admin JWT; otherwise the app redirects to `/login`.
