/**
 * @file role-permissions.ts
 * @module common/rbac
 * @description Maps each UserRole to allowed permissions; use for userHasPermission checks (future).
 * @author BharatERP
 * @created 2025-03-13
 */

import { UserRole } from '../../modules/user/entities/user.entity';
import { Permission, PERMISSIONS } from './permissions';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.LISTING_DELETE_OWN,
  ],
  [UserRole.BROKER]: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.LISTING_DELETE_OWN,
    PERMISSIONS.BROKER_VERIFIED,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.LISTING_CREATE,
    PERMISSIONS.LISTING_EDIT_OWN,
    PERMISSIONS.LISTING_DELETE_OWN,
    PERMISSIONS.LISTING_DELETE_ANY,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_STATS,
    PERMISSIONS.BROKER_VERIFIED,
  ],
};

/**
 * Returns whether a role has the given permission.
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
