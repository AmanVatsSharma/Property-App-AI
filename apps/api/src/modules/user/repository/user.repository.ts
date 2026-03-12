/**
 * @file user.repository.ts
 * @module user
 * @description Data access for User entity; findByPhone, findById, create, update.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(phone: string, displayName?: string | null): Promise<User> {
    const entity = this.repo.create({ phone, displayName: displayName ?? null });
    return this.repo.save(entity);
  }

  async updateDisplayName(id: string, displayName: string | null): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    user.displayName = displayName;
    return this.repo.save(user);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    user.role = role;
    return this.repo.save(user);
  }

  async findAll(limit: number, offset: number): Promise<[User[], number]> {
    return this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
