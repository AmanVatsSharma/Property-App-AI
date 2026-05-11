/**
 * File:        apps/api/src/modules/admin/dtos/admin-rest.dto.ts
 * Module:      admin · DTOs
 * Purpose:     Central re-export barrel for all admin REST API DTOs.
 *              Also re-exports shared enums (PropertyStatus, BrokerStatus, EnquiryStatus) from
 *              feature-specific DTO files so the controller/service can import from one place.
 *
 * Exports:
 *   - StatsResponse, PropertyStatus, BrokerStatus, EnquiryStatus  (legacy compat)
 *   - AdminPropertyFilterDto, AdminPropertyStatus, AdminPropertyUpdateDto,
 *     PropertyListQuery, AdminPropertyResponseDto, PropertyListResponse
 *   - AdminUserFilterDto, AdminUserUpdateDto, UserListQuery
 *   - AdminBrokerFilterDto, AdminBrokerVerifyDto, BrokerVerificationQuery
 *   - AdminEnquiryFilterDto, AdminEnquiryUpdateDto
 *   - AdminAiMetricsQuery, AuditLogQuery
 *
 * Depends on:
 *   - ./admin-stats.dto.ts
 *   - ./admin-properties.dto.ts
 *   - ./admin-users.dto.ts
 *   - ./admin-broker.dto.ts
 *   - ./admin-enquiry.dto.ts
 *   - ./admin-ai-metrics.dto.ts
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - This file is NOT meant to define new types — all types live in feature DTO files above.
 *     This barrel only re-exports for convenience.
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

// ── Shared types & enums ──────────────────────────────────────────────────────
export {
  PropertyStatus,
  BrokerStatus,
  EnquiryStatus,
  PropertyListQuery,
  UserListQuery,
  BrokerVerificationQuery,
  AIMetricsQuery,
  AuditLogQuery,
  PropertyStatusUpdateDto,
  BrokerVerificationDto,
  EnquiryStatusUpdateDto,
} from './types';

import type { AdminStatsResponse } from './types';
/** Alias for backward compat with any code that imports StatsResponse. */
export type StatsResponse = AdminStatsResponse;

// ── Properties ────────────────────────────────────────────────────────────────
export {
  AdminPropertyFilterDto,
  AdminPropertyStatus,
  AdminPropertyUpdateDto,
  PropertyListResponse,
  AdminPropertyResponseDto,
} from './admin-properties.dto';

// ── Users ────────────────────────────────────────────────────────────────────
export {
  AdminUserFilterDto,
  AdminUserUpdateDto,
  UserListResponse,
  AdminUserResponseDto,
} from './admin-users.dto';

// ── Brokers ───────────────────────────────────────────────────────────────────
export {
  AdminBrokerFilterDto,
  AdminBrokerVerifyDto,
  BrokerListResponse,
  AdminBrokerResponseDto,
  AdminBrokerStatus,
} from './admin-broker.dto';

// ── Enquiries ─────────────────────────────────────────────────────────────────
export {
  AdminEnquiryFilterDto,
  AdminEnquiryUpdateDto,
  EnquiryListResponse,
  AdminEnquiryResponseDto,
  AdminEnquiryStatus,
} from './admin-enquiry.dto';

// ── AI Metrics ────────────────────────────────────────────────────────────────
export {
  AdminAiMetricsQuery,
  AiMetricsResponse,
  DailyAiMetric,
  AiToolUsage,
  AiProviderCost,
} from './admin-ai-metrics.dto';
