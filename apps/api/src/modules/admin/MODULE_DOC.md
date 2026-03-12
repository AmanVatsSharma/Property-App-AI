# Admin Module

## Purpose

Expose admin-only GraphQL queries and mutations: paginated users list, dashboard stats, and role assignment. All resolvers are protected by `AdminGuard` (requires JWT with `role === 'admin'`), which uses the shared RolesGuard logic.

## Flows

- **users(limit?, offset?)**: Returns `{ users: User[], total: number }`. Delegates to UserService.findAll. AdminGuard required.
- **adminStats()**: Returns `{ propertyCount, userCount }`. Uses PropertyService.getCount and UserService.getCount. AdminGuard required.
- **setUserRole(userId, role)**: Admin-only mutation. Sets a user’s role (user | broker | admin). Returns the updated User. Throws NotFoundException if user not found.

## Data

- AdminStats: propertyCount (Int), userCount (Int).
- UsersListResult: users (array of User), total (Int).

## Changelog

- 2025-03-13: Added setUserRole(userId, role) mutation; AdminGuard refactored to use shared role check from common/guards/roles.guard.
- 2025-03-13: Added Admin module with AdminResolver (users, adminStats), AdminGuard, AdminStats and UsersListResult DTOs. Depends on UserModule and PropertyModule.
