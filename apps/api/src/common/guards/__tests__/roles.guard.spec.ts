/**
 * @file roles.guard.spec.ts
 * @module common/guards
 * @description Unit tests for RolesGuard and requireRoles (allow/deny by role).
 * @author BharatERP
 * @created 2025-03-13
 */

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard, getRequestFromContext, requireRoles } from '../roles.guard';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { UserRole } from '../../../modules/user/entities/user.entity';

function mockHttpContext(request: { user?: { role?: string } }): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('getRequestFromContext', () => {
  it('should return request from HTTP context', () => {
    const req = { user: { role: 'admin' } };
    const ctx = mockHttpContext(req);
    expect(getRequestFromContext(ctx)).toBe(req);
  });
});

describe('requireRoles', () => {
  it('should allow when allowedRoles is empty', () => {
    expect(() => requireRoles({ user: { role: 'user' } }, [])).not.toThrow();
  });

  it('should allow when user role is in allowed list', () => {
    expect(() => requireRoles({ user: { role: 'admin' } }, [UserRole.ADMIN])).not.toThrow();
    expect(() => requireRoles({ user: { role: 'broker' } }, [UserRole.BROKER, UserRole.ADMIN])).not.toThrow();
  });

  it('should throw ForbiddenException when user role is not in allowed list', () => {
    expect(() => requireRoles({ user: { role: 'user' } }, [UserRole.ADMIN])).toThrow(ForbiddenException);
    expect(() => requireRoles({ user: { role: 'user' } }, [UserRole.ADMIN])).toThrow('Insufficient role');
  });

  it('should throw when request has no user or role', () => {
    expect(() => requireRoles({}, [UserRole.ADMIN])).toThrow(ForbiddenException);
    expect(() => requireRoles({ user: {} }, [UserRole.ADMIN])).toThrow(ForbiddenException);
  });
});

describe('RolesGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should allow when no roles metadata (backward compatible)', () => {
    const guard = new RolesGuard(reflector);
    const ctx = mockHttpContext({ user: { role: 'user' } });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user role is in reflected roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const guard = new RolesGuard(reflector);
    const ctx = mockHttpContext({ user: { role: 'admin' } });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });

  it('should throw ForbiddenException when user role is not in reflected roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const guard = new RolesGuard(reflector);
    const ctx = mockHttpContext({ user: { role: 'user' } });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow('Insufficient role');
  });
});
