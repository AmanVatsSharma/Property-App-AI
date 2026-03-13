/**
 * @file roles.guard.ts
 * @module common/guards
 * @description Restricts access by role; use with @Roles(...). Expects req.user.role from JWT (after AuthGuard).
 * @author BharatERP
 * @created 2025-03-13
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@api/common/decorators/roles.decorator';
import { UserRole } from '@api/modules/user/entities/user.entity';

/** Shared: get request from HTTP or GraphQL context. */
export function getRequestFromContext(context: ExecutionContext): { user?: { role?: string } } {
  const type = context.getType<string>();
  if (type === 'http') {
    return context.switchToHttp().getRequest();
  }
  return GqlExecutionContext.create(context).getContext().req;
}

/** Shared: throw if request user role is not in allowed roles. */
export function requireRoles(request: { user?: { role?: string } }, allowedRoles: UserRole[]): void {
  if (!allowedRoles?.length) return;
  const role = request?.user?.role as string | undefined;
  if (!role || !allowedRoles.includes(role as UserRole)) {
    throw new ForbiddenException('Insufficient role');
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = getRequestFromContext(context);
    requireRoles(request, allowedRoles ?? []);
    return true;
  }
}
