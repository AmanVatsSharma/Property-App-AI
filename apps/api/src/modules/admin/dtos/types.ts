/**
 * File:        apps/api/src/modules/admin/dtos/types.ts
 * Module:      admin · Shared Types & Enums
 * Purpose:     Single source of truth for all admin REST API types, enums, and
 *              query DTOs. All other admin DTO files import from here.
 *              Prevents naming mismatches between barrel exports and actual exports.
 *
 * Exports:
 *   - PropertyStatus           — property listing status
 *   - BrokerStatus            — broker verification status
 *   - EnquiryStatus           — enquiry lifecycle status
 *   - AdminStatsResponse      — GET /admin/stats response shape
 *   - PropertyListQuery        — GET /admin/properties query params
 *   - UserListQuery           — GET /admin/users query params
 *   - BrokerVerificationQuery — GET /admin/brokers query params
 *   - AIMetricsQuery          — GET /admin/ai-metrics query params
 *   - AuditLogQuery           — GET /admin/audit-logs query params
 *   - PropertyStatusUpdateDto — PATCH /admin/properties/:id body
 *   - BrokerVerificationDto   — PATCH /admin/brokers/:id/verify body
 *   - EnquiryStatusUpdateDto  — PATCH /admin/enquiries/:id body
 *
 * Depends on:
 *   - @api/modules/user/entities/user.entity — UserRole enum
 *
 * Side-effects:  none
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@api/modules/user/entities/user.entity';

// ─── Enums ─────────────────────────────────────────────────────────────────────

/** Property listing status. */
export enum PropertyStatus {
  ACTIVE   = 'active',
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FEATURED = 'featured',
  ARCHIVED = 'archived',
}

/** Broker verification status. */
export enum BrokerStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  SUSPENDED = 'suspended',
}

/** Enquiry lifecycle status. */
export enum EnquiryStatus {
  NEW       = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  CLOSED    = 'closed',
}

// ─── Response Types ────────────────────────────────────────────────────────────

/** GET /admin/stats response. */
export interface AdminStatsResponse {
  propertyCount: number;
  userCount: number;
  brokerCount: number;
  enquiryCount: number;
  todayNewUsers: number;
  todayNewProperties: number;
  pendingBrokers: number;
  aiQueriesToday: number;
  aiTokenUsageToday: number;
  avgResponseTimeMs: number;
}

// ─── Query DTOs ────────────────────────────────────────────────────────────────

export class PropertyListQuery {
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
  status?: string;

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

export class UserListQuery {
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

  @IsOptional()
  @IsDateString()
  registeredAfter?: string;

  @IsOptional()
  @IsDateString()
  registeredBefore?: string;
}

export class BrokerVerificationQuery {
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
  @IsEnum(BrokerStatus, { message: 'status must be one of: pending, approved, rejected, suspended' })
  status?: BrokerStatus;
}

export class AIMetricsQuery {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

export class AuditLogQuery {
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
  action?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

// ─── Body DTOs ────────────────────────────────────────────────────────────────

export class PropertyStatusUpdateDto {
  @IsEnum(PropertyStatus, { message: 'status must be one of: active, pending, approved, rejected, featured, archived' })
  status!: PropertyStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BrokerVerificationDto {
  @IsEnum(BrokerStatus, { message: 'status must be one of: approved, rejected' })
  status!: BrokerStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reraVerified?: string;
}

export class EnquiryStatusUpdateDto {
  @IsEnum(EnquiryStatus, { message: 'status must be one of: new, contacted, converted, closed' })
  status!: EnquiryStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
