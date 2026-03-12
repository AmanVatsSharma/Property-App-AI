/**
 * @file admin.resolver.spec.ts
 * @module admin
 * @description Unit tests for AdminResolver: setUserRole (admin-only mutation).
 * @author BharatERP
 * @created 2025-03-13
 */

import { NotFoundException } from '@nestjs/common';
import { AdminResolver } from '../admin.resolver';
import { UserService } from '../../../user/services/user.service';
import { PropertyService } from '../../../property/services/property.service';
import { UserRole } from '../../../user/entities/user.entity';

const mockUser = {
  id: 'user-uuid',
  phone: '9876543210',
  displayName: null,
  role: UserRole.BROKER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AdminResolver', () => {
  let resolver: AdminResolver;
  let userService: { findById: jest.Mock; setRole: jest.Mock };

  beforeEach(() => {
    userService = {
      findById: jest.fn().mockResolvedValue(mockUser),
      setRole: jest.fn().mockResolvedValue({ ...mockUser, role: UserRole.BROKER }),
    };
    resolver = new AdminResolver(
      userService as unknown as UserService,
      {} as unknown as PropertyService,
    );
  });

  describe('setUserRole', () => {
    it('should return updated user when user exists', async () => {
      const result = await (resolver as any).setUserRole('user-uuid', UserRole.BROKER);
      expect(userService.findById).toHaveBeenCalledWith('user-uuid');
      expect(userService.setRole).toHaveBeenCalledWith('user-uuid', UserRole.BROKER);
      expect(result.role).toBe(UserRole.BROKER);
    });

    it('should throw NotFoundException when user not found', async () => {
      userService.findById.mockResolvedValue(null);
      await expect((resolver as any).setUserRole('missing-id', UserRole.ADMIN)).rejects.toThrow(
        NotFoundException,
      );
      await expect((resolver as any).setUserRole('missing-id', UserRole.ADMIN)).rejects.toThrow(
        'User not found',
      );
      expect(userService.setRole).not.toHaveBeenCalled();
    });
  });
});
