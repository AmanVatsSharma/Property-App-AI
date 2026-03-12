/**
 * @file auth.guard.ts
 * @module common/guards
 * @description JWT auth guard; use @Public() to skip. Validates Bearer token when JWT_SECRET is set.
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || secret.trim() === '') {
      return true;
    }
    const type = context.getType<string>();
    const request =
      type === 'http'
        ? context.switchToHttp().getRequest<{ headers?: { authorization?: string }; user?: unknown }>()
        : GqlExecutionContext.create(context).getContext().req;
    const authHeader = request?.headers?.authorization;
    const token = authHeader?.replace?.('Bearer ', '')?.trim();
    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization');
    }
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
