# Module: user

**Short:** Persist user identity by unique phone; profile read/update and role (user/broker/admin) for auth and admin.

**Purpose:** Users are created on first OTP login (AuthService calls **UserService.getOrCreateByPhone**). Identity is keyed by **phone** (unique). The module exposes **me** (current user) and **updateMyProfile** (displayName). **Role** (user | broker | admin) is set on login from env allowlists or by admin via **setUserRole** (Admin module). JWT sub is user id; role is included in JWT for RolesGuard/AdminGuard.

**Files:**

- `entities/user.entity.ts` — **User** entity: id (UUID), phone (unique), displayName (nullable), role (UserRole), createdAt, updatedAt.
- `repository/user.repository.ts` — Data access: findByPhone, findById, create, updateDisplayName, updateRole, findAll, count.
- `services/user.service.ts` — getOrCreateByPhone, findById, updateProfile, setRole, findAll, getCount.
- `resolvers/user.resolver.ts` — GraphQL **me** (Query), **updateMyProfile** (Mutation).
- `dtos/update-profile.dto.ts` — **UpdateProfileInput** (displayName optional, max 200).
- `user.module.ts` — Registers entity, repository, service, resolver; exports UserService.
- `index.ts` — Re-exports UserModule, User, UserService.

**Dependencies:** TypeOrmModule (User entity), LoggerModule. Consumed by Auth module (getOrCreateByPhone, setRole on verifyOtp) and Admin module (UserService.findAll, getCount, setRole for setUserRole).

**APIs:**

- **me** (Query) — Returns current user from request context (auth required). Uses **UserService.findById**.
- **updateMyProfile(input: UpdateProfileInput)** (Mutation) — Updates **displayName** for current user (auth required).
- **setUserRole** is in the Admin module; it calls **UserService.setRole** to set any user’s role (user | broker | admin).

**Env vars:** **ADMIN_PHONES**, **BROKER_PHONES** — Used by Auth on **verifyOtp** for role assignment (admin takes precedence over broker). Not read in this module; see auth module config.

**Flow**

- **verifyOtp:** AuthService calls **UserService.getOrCreateByPhone(phone)**; if phone is in **ADMIN_PHONES**, **UserService.setRole(userId, admin)**; else if in **BROKER_PHONES**, setRole(userId, broker). JWT is issued with sub, phone, role. VerifyOtpResult returns token and user { id, phone, displayName, role }.
- **me:** Requires auth; returns current user from **ctx.req.user.sub** (includes role).
- **updateMyProfile:** Requires auth; updates **displayName** for current user.
- **setUserRole:** Admin-only (AdminResolver); sets any user’s role via **UserService.setRole**. Alternative to env allowlists for broker assignment.

**Data**

- **User:** id (UUID), phone (unique), displayName (nullable), role (user | broker | admin, default user), createdAt, updatedAt.
- **Roles:** **user** (default) — consumer/lister; **broker** — verified agent (allowlist or admin-assigned); **admin** — platform operator (ADMIN_PHONES or setUserRole). JWT payload includes **role** for RolesGuard/AdminGuard.
- **Assignment:** Admin via env **ADMIN_PHONES** (comma-separated); broker via env **BROKER_PHONES** and/or admin mutation **setUserRole**.

**Change-log**

- 2026-03-15: MVP readiness: no mock data; deploy and env checklist in docs/DEPLOYMENT.md.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: Enterprise RBAC — UserRole extended with BROKER; BROKER_PHONES env; AuthService sets broker on login when phone in allowlist (admin takes precedence). Generic RolesGuard + @Roles() decorator; AdminGuard refactored to use shared role check. Admin-only setUserRole(userId, role) mutation. Optional common/rbac: PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission.
- 2025-03-13: Added role field (UserRole enum, default user); migration AddUserRole; ADMIN_PHONES env; AuthService sets admin role on verifyOtp when phone in allowlist; JWT includes role; UserService.setRole, UserRepository.updateRole, findAll, count; admin module uses UserService.findAll and getCount for users list and adminStats.
- 2025-03-12: Added User entity, UserService (getOrCreateByPhone, findById, updateProfile), UserResolver (me, updateMyProfile). Auth verifyOtp now get-or-creates User and returns user in result.
