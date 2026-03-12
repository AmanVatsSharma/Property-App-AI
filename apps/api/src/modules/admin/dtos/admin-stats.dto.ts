/**
 * @file admin-stats.dto.ts
 * @module admin
 * @description GraphQL object type for admin dashboard stats (property and user counts).
 * @author BharatERP
 * @created 2025-03-13
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AdminStats {
  @Field(() => Int, { description: 'Total number of properties' })
  propertyCount: number;

  @Field(() => Int, { description: 'Total number of users' })
  userCount: number;
}
