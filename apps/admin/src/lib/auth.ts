/**
 * @file auth.ts
 * @module admin/lib
 * @description Token management for admin panel using httpOnly cookies via Next.js API routes.
 *   The cookie is never accessible to client-side JS (httpOnly); this module uses
 *   the /api/auth/* route handlers as an intermediary.
 * @author BharatERP
 * @created 2025-03-13
 * @updated 2026-03-26 Replaced localStorage with httpOnly cookie via /api/auth/* routes.
 */

/** Persist a token by calling the server-side cookie route. */
export async function setToken(token: string): Promise<void> {
  await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

/** Clear the admin session cookie. */
export async function clearToken(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Hydrate auth state from the httpOnly cookie.
 * Returns the token string if the cookie is set, null otherwise.
 * Should only be called on mount (client-side).
 */
export async function getToken(): Promise<string | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return typeof data?.token === "string" ? data.token : null;
}
