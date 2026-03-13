/**
 * @file users-list.dto.ts
 * @module admin
 * @description GraphQL object type for paginated users list (admin only).
 * @author BharatERP
 * @created 2025-03-13
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '@api/modules/user/entities/user.entity';

@ObjectType()
export class UsersListResult {
  @Field(() => [User], { description: 'List of users' })
  users: User[];

  @Field(() => Int, { description: 'Total count of users' })
  total: number;
}
