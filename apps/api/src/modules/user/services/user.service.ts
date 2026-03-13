/**
 * @file user.service.ts
 * @module user
 * @description Get or create user by phone; findById; update profile.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { LoggerService } from '@api/shared/logger';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async getOrCreateByPhone(phone: string): Promise<User> {
    const existing = await this.userRepo.findByPhone(phone);
    if (existing) {
      this.logger.debug('getOrCreateByPhone found', { userId: existing.id, phone });
      return existing;
    }
    const created = await this.userRepo.create(phone);
    this.logger.debug('getOrCreateByPhone created', { userId: created.id, phone });
    return created;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async updateProfile(userId: string, data: { displayName?: string | null }): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (data.displayName !== undefined) {
      return this.userRepo.updateDisplayName(userId, data.displayName);
    }
    return user;
  }

  async setRole(userId: string, role: UserRole): Promise<User> {
    return this.userRepo.updateRole(userId, role);
  }

  async findAll(limit = 20, offset = 0): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepo.findAll(limit, offset);
    return { users, total };
  }

  async getCount(): Promise<number> {
    return this.userRepo.count();
  }
}
