/**
 * @file admin.resolver.ts
 * @module admin
 * @description GraphQL resolver for admin-only queries and mutations: users list, stats, setUserRole.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { AdminGuard } from '@api/common/guards/admin.guard';
import { UserService } from '@api/modules/user/services/user.service';
import { PropertyService } from '@api/modules/property/services/property.service';
import { User, UserRole } from '@api/modules/user/entities/user.entity';
import { AdminStats } from '../dtos/admin-stats.dto';
import { UsersListResult } from '../dtos/users-list.dto';

@Resolver()
export class AdminResolver {
  constructor(
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
  ) {}

  @UseGuards(AdminGuard)
  @Query(() => UsersListResult, { name: 'users' })
  async users(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 })
    offset: number,
  ): Promise<UsersListResult> {
    return this.userService.findAll(limit, offset);
  }

  @UseGuards(AdminGuard)
  @Query(() => AdminStats, { name: 'adminStats' })
  async adminStats(): Promise<AdminStats> {
    const [propertyCount, userCount] = await Promise.all([
      this.propertyService.getCount(),
      this.userService.getCount(),
    ]);
    return { propertyCount, userCount };
  }

  @UseGuards(AdminGuard)
  @Mutation(() => User, { name: 'setUserRole' })
  async setUserRole(
    @Args('userId') userId: string,
    @Args('role', { type: () => UserRole }) role: UserRole,
  ): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.setRole(userId, role);
  }
}
