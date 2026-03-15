# Module: admin

**Short:** Admin-only GraphQL API (users list, dashboard stats, role assignment) protected by AdminGuard.

## Purpose

Expose admin-only GraphQL queries and mutations: paginated users list, dashboard stats, and role assignment. All resolvers are protected by **AdminGuard** (requires JWT with `role === 'admin'`), which uses the shared RolesGuard logic from `common/guards/roles.guard`.

## Files

- **admin.module.ts** — Nest module; imports UserModule and PropertyModule; registers AdminGuard and AdminResolver.
- **resolvers/admin.resolver.ts** — GraphQL resolver: `users`, `adminStats`, `setUserRole`; delegates to UserService and PropertyService.
- **dtos/admin-stats.dto.ts** — GraphQL object type AdminStats (propertyCount, userCount).
- **dtos/users-list.dto.ts** — GraphQL object type UsersListResult (users array, total count).
- **resolvers/__tests__/admin.resolver.spec.ts** — Unit tests for AdminResolver.

## Dependencies

- **UserModule** — UserService (findAll, getCount, findById, setRole).
- **PropertyModule** — PropertyService (getCount).
- **AdminGuard** (`@api/common/guards/admin.guard`) — Restricts access to users with role `admin`; thin wrapper over `requireRoles(request, [UserRole.ADMIN])`.

## APIs

**GraphQL**

- **Query `users(limit?, offset?)`** — Returns `UsersListResult` (`users: [User], total: Int`). Defaults: limit 20, offset 0. AdminGuard required.
- **Query `adminStats()`** — Returns `AdminStats` (`propertyCount: Int`, `userCount: Int`). AdminGuard required.
- **Mutation `setUserRole(userId: String!, role: UserRole!)`** — Sets a user’s role (`user` | `broker` | `admin`). Returns updated `User`. Throws NotFoundException if user not found. AdminGuard required.

## Env vars

None in this module. Admin access is granted via auth/user config (e.g. **ADMIN_PHONES** in env) or by an existing admin using **setUserRole**.

## Flows

- **users** — Resolver calls `UserService.findAll(limit, offset)` and returns `{ users, total }`.
- **adminStats** — Resolver calls `PropertyService.getCount()` and `UserService.getCount()` in parallel, returns `{ propertyCount, userCount }`.
- **setUserRole** — Resolver loads user by `userId`, throws if not found, then calls `UserService.setRole(userId, role)` and returns the updated User.

## Data

- **AdminStats:** **propertyCount** (Int), **userCount** (Int).
- **UsersListResult:** **users** ([User]), **total** (Int).

## Change-log

- 2026-03-15: MVP readiness: no mock data; deploy and env checklist in docs/DEPLOYMENT.md.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: Added setUserRole(userId, role) mutation; AdminGuard refactored to use shared role check from common/guards/roles.guard.
- 2025-03-13: Added Admin module with AdminResolver (users, adminStats), AdminGuard, AdminStats and UsersListResult DTOs. Depends on UserModule and PropertyModule.
