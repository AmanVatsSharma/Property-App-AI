/**
 * @file roles.decorator.ts
 * @module common/decorators
 * @description Sets allowed roles for RolesGuard; use with @UseGuards(RolesGuard).
 * @author BharatERP
 * @created 2025-03-13
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/user/entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
