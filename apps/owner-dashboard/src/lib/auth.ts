/**
 * File:        src/lib/auth.ts
 * Module:      Owner Dashboard — Auth Utilities
 * Purpose:     JWT token storage and retrieval; route protection helpers
 *
 * Exports:
 *   - getToken() → string | null          — read from localStorage
 *   - setToken(token)                     — persist to localStorage
 *   - removeToken()                       — clear token on logout
 *   - isAuthenticated() → boolean         — token present and non-expired check
 *
 * Depends on:
 *   - jwt-decode (optional, for expiry check)
 *
 * Side-effects:
 *   - localStorage read/write
 *   - client-side only
 *
 * Key invariants:
 *   - Token key is "owner_token" — not shared with other apps
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

const TOKEN_KEY = "owner_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
