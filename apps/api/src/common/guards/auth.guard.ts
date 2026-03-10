/**
 * @file auth.guard.ts
 * @module common/guards
 * @description Placeholder auth guard; use @Public() to skip. Real JWT validation TBD.
 * @author BharatERP
 * @created 2025-03-10
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const type = context.getType<string>();
    const request =
      type === 'http'
        ? context.switchToHttp().getRequest<{ headers?: { authorization?: string } }>()
        : GqlExecutionContext.create(context).getContext().req;
    const token = request?.headers?.authorization?.replace?.('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization');
    }
    return true;
  }
}
