/**
 * File:        apps/api/src/modules/admin/dtos/admin-broker.dto.ts
 * Module:      admin · DTOs
 * Purpose:     REST DTOs for broker verification in admin dashboard.
 *
 * Exports:
 *   - AdminBrokerFilterDto     — query params for GET /admin/brokers
 *   - AdminBrokerResponseDto   — serialised broker request for list view
 *   - AdminBrokerVerifyDto     — PATCH body for /admin/brokers/:id/verify
 *   - BrokerListResponse        — paginated wrapper
 *
 * Depends on:
 *   - @api/modules/broker/entities/broker-request.entity — BrokerRequest entity
 *   - @api/modules/user/entities/user.entity             — UserRole enum
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - RERA verification ID is stored in broker.adminNote as JSON
 *   - Reviewed-by user is tracked in broker.reviewedByUserId
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/** Broker request status values. */
export enum AdminBrokerStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  SUSPENDED = 'suspended',
}

/**
 * Query parameters for GET /admin/brokers.
 */
export class AdminBrokerFilterDto {
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
  @IsEnum(AdminBrokerStatus, { message: 'status must be one of: pending, approved, rejected, suspended' })
  status?: AdminBrokerStatus;
}

/**
 * Admin-facing broker request response — includes user details for the admin to review.
 */
@ObjectType()
export class AdminBrokerResponseDto {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  status!: string;

  @Field(() => Int, { nullable: true })
  reviewedAt!: Date | null;

  @Field(() => String, { nullable: true })
  reviewedByUserId!: string | null;

  @Field(() => Int)
  createdAt!: Date;

  /** Human-readable review note (may contain RERA ID JSON or free-text). */
  @Field(() => String, { nullable: true })
  adminNote!: string | null;
}

/** Paginated wrapper for broker list. */
@ObjectType()
export class BrokerListResponse {
  @Field(() => [AdminBrokerResponseDto])
  data!: AdminBrokerResponseDto[];

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
 * Request body for PATCH /admin/brokers/:id/verify.
 * `status` is required; `reason` is stored as adminNote; `reraVerified` stored in adminNote JSON.
 */
export class AdminBrokerVerifyDto {
  @IsEnum(AdminBrokerStatus, { message: 'status must be one of: approved, rejected' })
  status!: AdminBrokerStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  /** RERA registration number — stored as JSON inside adminNote for future retrieval. */
  @IsOptional()
  @IsString()
  reraVerified?: string;
}