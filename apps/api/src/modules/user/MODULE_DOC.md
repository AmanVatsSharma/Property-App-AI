# User Module

## Purpose

Persist user identity by unique phone number. Users are created on first OTP login (verifyOtp); JWT sub is user id. Supports profile read (me) and update (displayName). Roles: user (default), broker, admin.

## Flows

- **verifyOtp:** AuthService calls UserService.getOrCreateByPhone(phone); if phone is in `ADMIN_PHONES`, UserService.setRole(userId, admin); else if in `BROKER_PHONES`, setRole(userId, broker). JWT is issued with sub, phone, role. VerifyOtpResult returns token and user { id, phone, displayName, role }.
- **me:** Requires auth; returns current user from ctx.req.user.sub (includes role).
- **updateMyProfile:** Requires auth; updates displayName for current user.
- **setUserRole:** Admin-only mutation (AdminResolver); sets any user’s role (user | broker | admin) via UserService.setRole. Alternative to env allowlists for broker assignment.

## Data

- User: id (UUID), phone (unique), displayName (nullable), role (user | broker | admin, default user), createdAt, updatedAt.
- **Roles:** `user` (default) — consumer/lister; `broker` — verified agent (allowlist or admin-assigned); `admin` — platform operator (ADMIN_PHONES or setUserRole). JWT payload includes `role` for RolesGuard/AdminGuard.
- **Assignment:** Admin via env `ADMIN_PHONES` (comma-separated); broker via env `BROKER_PHONES` and/or admin mutation `setUserRole`.

## Changelog

- 2025-03-13: Enterprise RBAC — UserRole extended with BROKER; BROKER_PHONES env; AuthService sets broker on login when phone in allowlist (admin takes precedence). Generic RolesGuard + @Roles() decorator; AdminGuard refactored to use shared role check. Admin-only setUserRole(userId, role) mutation. Optional common/rbac: PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission.
- 2025-03-13: Added role field (UserRole enum, default user); migration AddUserRole; ADMIN_PHONES env; AuthService sets admin role on verifyOtp when phone in allowlist; JWT includes role; UserService.setRole, UserRepository.updateRole, findAll, count; admin module uses UserService.findAll and getCount for users list and adminStats.
- 2025-03-12: Added User entity, UserService (getOrCreateByPhone, findById, updateProfile), UserResolver (me, updateMyProfile). Auth verifyOtp now get-or-creates User and returns user in result.
