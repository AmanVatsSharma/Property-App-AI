/**
 * File:        src/lib/api-client.ts
 * Module:      Owner Dashboard — API Client
 * Purpose:     Fetch wrapper with auth header injection
 *
 * Exports:
 *   - apiFetch(url, options?) → Promise<T>   — fetch with Bearer token
 *
 * Depends on:
 *   - @/lib/auth             — getToken()
 *
 * Side-effects:
 *   - reads localStorage for token (browser only)
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("owner_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `HTTP ${res.status} — ${res.statusText}`
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ─── Admin API (barrel re-export) ─────────────────────────────────────────────

export {
  getAdminStats,
  getProperties,
  updatePropertyStatus,
  getUsers,
  updateUserRole,
  getBrokers,
  verifyBroker,
  getEnquiries,
  updateEnquiryStatus,
  getAIMetrics,
  loginWithOtp,
  verifyOtp,
} from "./admin-api";
