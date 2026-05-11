/**
 * File:        src/lib/admin-api.ts
 * Module:      Owner Dashboard — Admin API
 * Purpose:     Typed API calls to NestJS admin REST endpoints.
 *              Interface types reflect actual API response shapes.
 *              Types are shaped to match what dashboard table components expect.
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
import { apiFetch } from "./api-client";

// ─── Types (matched to table component interfaces) ────────────────────────────

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

/** Shape expected by PropertyTable component. */
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string; // city or locality string for display
  city: string | null;
  status: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number | null;
  isVerified: boolean;
  isFreeListing: boolean;
  aiScore?: number | null;
  coverImageUrl?: string | null;
  createdAt: Date | string;
  listingFor?: string | null;
}

/** Shape expected by UserTable component. */
export interface User {
  id: string;
  phone: string;
  name?: string; // API displayName mapped to name
  displayName: string | null;
  role: string;
  isVerified: boolean;
  verified: boolean;
  email?: string;
  createdAt: Date | string;
}

/** Shape expected by BrokerTable component. */
export interface Broker {
  id: string;
  userId: string;
  name?: string;
  phone: string;
  email?: string;
  reraId?: string;
  status: string;
  documentUrl?: string;
  adminNote?: string | null;
  createdAt: Date | string;
}

/** Shape expected by EnquiryTable component. */
export interface Enquiry {
  id: string;
  propertyId: string;
  fromUserId: string;
  enquirerName: string;
  enquirerPhone: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: string;
  createdAt: Date | string;
}

export interface AIMetrics {
  totalQueries: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgResponseTimeMs: number;
  estimatedCostUsd: number;
  errorRate: number;
  queriesByDay: Array<{ date: string; queryCount: number; tokenCount: number; costUsd: number }>;
  topTools: Array<{ tool: string; callCount: number; fraction: number }>;
  costByProvider: Array<{ provider: string; tokens: number; costUsd: number; fraction: number }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginWithOtp(phone: string) {
  return apiFetch<{ success: boolean; message: string }>("/auth/otp/whatsapp/send", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string) {
  return apiFetch<{ token: string }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  return apiFetch<AdminStatsResponse>("/admin/stats");
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function getProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
}) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  );
  const qs = new URLSearchParams(filtered as Record<string, string>).toString();
  return apiFetch<PaginatedResult<Property>>(`/admin/properties${qs ? `?${qs}` : ""}`);
}

export async function updatePropertyStatus(id: string, status: string, reason?: string) {
  await apiFetch(`/admin/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  );
  const qs = new URLSearchParams(filtered as Record<string, string>).toString();
  return apiFetch<PaginatedResult<User>>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function updateUserRole(id: string, role: string) {
  await apiFetch(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// ─── Brokers ───────────────────────────────────────────────────────────────────

export async function getBrokers(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  );
  const qs = new URLSearchParams(filtered as Record<string, string>).toString();
  return apiFetch<PaginatedResult<Broker>>(`/admin/brokers${qs ? `?${qs}` : ""}`);
}

export async function verifyBroker(id: string, dto: { status: string; reason?: string; reraVerified?: string }) {
  await apiFetch(`/admin/brokers/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

// ─── Enquiries ─────────────────────────────────────────────────────────────────

export async function getEnquiries(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  );
  const qs = new URLSearchParams(filtered as Record<string, string>).toString();
  return apiFetch<PaginatedResult<Enquiry>>(`/admin/enquiries${qs ? `?${qs}` : ""}`);
}

export async function updateEnquiryStatus(id: string, status: string, notes?: string) {
  await apiFetch(`/admin/enquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
}

// ─── AI Metrics ───────────────────────────────────────────────────────────────

export async function getAIMetrics(params?: {
  startDate?: string;
  endDate?: string;
  provider?: string;
}) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  );
  const qs = new URLSearchParams(filtered as Record<string, string>).toString();
  return apiFetch<AIMetrics>(`/admin/ai-metrics${qs ? `?${qs}` : ""}`);
}