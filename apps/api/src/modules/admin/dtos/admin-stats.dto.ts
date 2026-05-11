/**
 * File:        apps/api/src/modules/admin/dtos/admin-stats.dto.ts
 * Module:      admin · DTOs
 * Purpose:     GraphQL object types for admin dashboard stats.
 *              Note: REST DTOs for stats live in admin-rest.dto.ts (barrel re-export).
 *
 * Exports:
 *   - AdminStats    — GraphQL type for legacy GraphQL resolver stats query
 *
 * Depends on:
 *   - none
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - This file contains only GraphQL @ObjectType classes (no class-validator DTOs)
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AdminStats {
  @Field(() => Int, { description: 'Total number of properties' })
  propertyCount: number;

  @Field(() => Int, { description: 'Total number of users' })
  userCount: number;
}