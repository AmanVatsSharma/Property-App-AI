/**
 * @file admin.guard.ts
 * @module common/guards
 * @description Restricts access to admin users only; thin wrapper over RolesGuard logic. Use after AuthGuard.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../modules/user/entities/user.entity';
import { getRequestFromContext, requireRoles } from './roles.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getRequestFromContext(context);
    requireRoles(request, [UserRole.ADMIN]);
    return true;
  }
}
