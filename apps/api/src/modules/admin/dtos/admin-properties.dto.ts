/**
 * File:        apps/api/src/modules/admin/dtos/admin-properties.dto.ts
 * Module:      admin · DTOs
 * Purpose:     REST DTOs for property list/filter/update in admin dashboard.
 *
 * Exports:
 *   - AdminPropertyFilterDto       — query params for GET /admin/properties
 *   - AdminPropertyResponseDto    — serialised property for admin list view
 *   - AdminPropertyUpdateDto       — PATCH body for /admin/properties/:id
 *   - PropertyListResponse        — paginated list wrapper
 *
 * Depends on:
 *   - @api/modules/property/entities/property.entity — Property entity shape
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - page/limit pagination replaced the offset-based pagination used internally
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/** Valid property status transitions in admin context. */
export enum AdminPropertyStatus {
  ACTIVE    = 'active',
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  FEATURED  = 'featured',
  ARCHIVED  = 'archived',
}

/** Enum values mirror the Property entity's nullable status column. */
export type PropertyStatusFilter = 'active' | 'pending' | 'approved' | 'rejected' | 'featured' | 'archived';

/**
 * Query parameters for GET /admin/properties.
 * All fields are optional — omitted fields are treated as "no filter".
 */
export class AdminPropertyFilterDto {
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
  @IsString()
  status?: PropertyStatusFilter;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}

/**
 * Admin-facing property response — exposes fields needed by the dashboard list view.
 * Not a 1:1 map of the Property entity; adds computed / human-readable fields.
 */
@ObjectType()
export class AdminPropertyResponseDto {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  location!: string;

  @Field(() => String, { nullable: true })
  city!: string | null;

  @Field(() => String, { nullable: true })
  locality!: string | null;

  @Field(() => Int)
  price!: number;

  @Field(() => String)
  type!: string;

  @Field(() => Int)
  bedrooms!: number;

  @Field(() => Int)
  bathrooms!: number;

  @Field(() => Int, { nullable: true })
  areaSqft!: number | null;

  @Field(() => String, { nullable: true })
  status!: string | null;

  @Field(() => String, { nullable: true })
  listingFor!: string | null;

  @Field(() => Int)
  viewCount!: number;

  @Field(() => Boolean)
  isVerified!: boolean;

  @Field(() => Boolean)
  isFreeListing!: boolean;

  @Field(() => Int, { nullable: true })
  aiScore!: number | null;

  @Field(() => String, { nullable: true })
  coverImageUrl!: string | null;

  @Field(() => String, { nullable: true })
  createdByUserId!: string | null;

  @Field(() => Int)
  createdAt!: Date;
}

/** Wraps a paginated property list with metadata. */
@ObjectType()
export class PropertyListResponse {
  @Field(() => [AdminPropertyResponseDto])
  data!: AdminPropertyResponseDto[];

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
 * Request body for PATCH /admin/properties/:id.
 * `status` is the only required field — reason is optional audit trail.
 */
export class AdminPropertyUpdateDto {
  @IsEnum(AdminPropertyStatus, { message: 'status must be one of: active, pending, approved, rejected, featured, archived' })
  status!: AdminPropertyStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}