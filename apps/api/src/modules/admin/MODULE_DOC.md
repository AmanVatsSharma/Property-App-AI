# Admin Module

## Purpose

Expose admin-only GraphQL queries: paginated users list and dashboard stats (property count, user count). All resolvers are protected by `AdminGuard` (requires JWT with `role === 'admin'`).

## Flows

- **users(limit?, offset?)**: Returns `{ users: User[], total: number }`. Delegates to UserService.findAll. AdminGuard ensures only admin users can call.
- **adminStats()**: Returns `{ propertyCount, userCount }`. Uses PropertyService.getCount and UserService.getCount. AdminGuard required.

## Data

- AdminStats: propertyCount (Int), userCount (Int).
- UsersListResult: users (array of User), total (Int).

## Changelog

- 2025-03-13: Added Admin module with AdminResolver (users, adminStats), AdminGuard, AdminStats and UsersListResult DTOs. Depends on UserModule and PropertyModule.
