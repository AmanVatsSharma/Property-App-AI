/**
 * File:        apps/api/src/modules/admin/dtos/admin-users.dto.ts
 * Module:      admin · DTOs
 * Purpose:     REST DTOs for user list/filter/update in admin dashboard.
 *
 * Exports:
 *   - AdminUserFilterDto        — query params for GET /admin/users
 *   - AdminUserResponseDto      — serialised user for admin list view
 *   - AdminUserUpdateDto        — PATCH body for /admin/users/:id
 *   - UserListResponse          — paginated wrapper
 *
 * Depends on:
 *   - @api/modules/user/entities/user.entity — User entity, UserRole enum
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - verified field maps to a boolean; the entity has no verified flag so we derive it
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@api/modules/user/entities/user.entity';

/**
 * Query parameters for GET /admin/users.
 * All fields are optional.
 */
export class AdminUserFilterDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be one of: user, broker, admin' })
  role?: UserRole;

  /** Derived: a user is considered "verified" if they have a non-null displayName. */
  @IsOptional()
  @IsString()
  verified?: string; // 'true' | 'false' parsed manually

  @IsOptional()
  @IsDateString()
  registeredAfter?: string;

  @IsOptional()
  @IsDateString()
  registeredBefore?: string;

  @IsOptional()
  @IsString()
  search?: string; // searches phone or displayName
}

/**
 * Admin-facing user response — lightweight user record for dashboard list.
 */
@ObjectType()
export class AdminUserResponseDto {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  phone!: string;

  @Field(() => String, { nullable: true })
  displayName!: string | null;

  @Field(() => String)
  role!: UserRole;

  @Field(() => Boolean)
  isVerified!: boolean; // derived: displayName !== null

  @Field(() => Int)
  createdAt!: Date;
}

/** Wraps a paginated user list with metadata. */
@ObjectType()
export class UserListResponse {
  @Field(() => [AdminUserResponseDto])
  data!: AdminUserResponseDto[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  totalPages!: number;
}

/**
 * Request body for PATCH /admin/users/:id.
 * Only `status` is supported (active | suspended).
 */
export class AdminUserUpdateDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be one of: user, broker, admin' })
  role?: UserRole;

  /** Suspends the user account. Internal status flag; entity does not have a dedicated suspended field. */
  @IsOptional()
  @IsString()
  status?: 'active' | 'suspended';
}