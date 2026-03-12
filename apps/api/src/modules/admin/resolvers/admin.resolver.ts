/**
 * @file admin.resolver.ts
 * @module admin
 * @description GraphQL resolver for admin-only queries: users list and dashboard stats.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { UserService } from '../../user/services/user.service';
import { PropertyService } from '../../property/services/property.service';
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
}
