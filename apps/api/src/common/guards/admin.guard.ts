/**
 * @file admin.guard.ts
 * @module common/guards
 * @description Restricts access to admin users only; use after AuthGuard. Expects req.user.role from JWT.
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

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const type = context.getType<string>();
    const request =
      type === 'http'
        ? context.switchToHttp().getRequest<{ user?: { role?: string } }>()
        : GqlExecutionContext.create(context).getContext().req;
    const role = request?.user?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
