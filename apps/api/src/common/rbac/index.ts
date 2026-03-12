/**
 * @file index.ts
 * @module common/rbac
 * @description Re-exports RBAC permissions and role-permission map.
 * @author BharatERP
 * @created 2025-03-13
 */

export { PERMISSIONS, type Permission } from './permissions';
export { ROLE_PERMISSIONS, roleHasPermission } from './role-permissions';
