/**
 * File:        apps/api/src/modules/admin/dtos/admin-enquiry.dto.ts
 * Module:      admin · DTOs
 * Purpose:     REST DTOs for enquiry list/update in admin dashboard.
 *
 * Exports:
 *   - AdminEnquiryFilterDto    — query params for GET /admin/enquiries
 *   - AdminEnquiryResponseDto — serialised enquiry for admin list view
 *   - AdminEnquiryUpdateDto   — PATCH body for /admin/enquiries/:id
 *   - EnquiryListResponse      — paginated wrapper
 *
 * Depends on:
 *   - @api/modules/enquiry/entities/enquiry.entity — Enquiry entity
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - status transitions: new → contacted → converted | closed (no backward transitions)
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/** Enquiry lifecycle status values. */
export enum AdminEnquiryStatus {
  NEW       = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  CLOSED    = 'closed',
}

/**
 * Query parameters for GET /admin/enquiries.
 */
export class AdminEnquiryFilterDto {
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
  @IsEnum(AdminEnquiryStatus, { message: 'status must be one of: new, contacted, converted, closed' })
  status?: AdminEnquiryStatus;

  /** Filter by property UUID. */
  @IsOptional()
  @IsString()
  propertyId?: string;

  /** Filter by user UUID who created the enquiry. */
  @IsOptional()
  @IsString()
  fromUserId?: string;
}

/**
 * Admin-facing enquiry response — includes short message preview and status.
 */
@ObjectType()
export class AdminEnquiryResponseDto {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  propertyId!: string;

  @Field(() => String)
  fromUserId!: string;

  @Field(() => String, { nullable: true })
  ownerUserId!: string | null;

  /** Message preview — truncated to 200 chars for list display. */
  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String)
  status!: string;

  @Field(() => Int)
  createdAt!: Date;
}

/** Paginated wrapper for enquiry list. */
@ObjectType()
export class EnquiryListResponse {
  @Field(() => [AdminEnquiryResponseDto])
  data!: AdminEnquiryResponseDto[];

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
 * Request body for PATCH /admin/enquiries/:id.
 * Only `status` is required.
 */
export class AdminEnquiryUpdateDto {
  @IsEnum(AdminEnquiryStatus, { message: 'status must be one of: contacted, converted, closed' })
  status!: AdminEnquiryStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}