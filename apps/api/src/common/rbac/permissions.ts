/**
 * @file permissions.ts
 * @module common/rbac
 * @description Permission constants for fine-grained access; use with role-permission map or RequirePermission guard (future).
 * @author BharatERP
 * @created 2025-03-13
 */

export const PERMISSIONS = {
  LISTING_CREATE: 'listing:create',
  LISTING_EDIT_OWN: 'listing:edit_own',
  LISTING_DELETE_OWN: 'listing:delete_own',
  LISTING_DELETE_ANY: 'listing:delete_any',
  ADMIN_USERS: 'admin:users',
  ADMIN_STATS: 'admin:stats',
  BROKER_VERIFIED: 'broker:verified',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
