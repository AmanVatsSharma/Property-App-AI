/**
 * @file AuthProvider.tsx
 * @module providers
 * @description Auth state and token for OTP sign-in.
 *   Token is stored in an httpOnly cookie (set via /api/auth/login) and
 *   relayed to client state via /api/auth/me on mount.
 *   localStorage is kept as a legacy fallback for SSR-less environments.
 * @author BharatERP
 * @created 2025-03-12
 * @updated 2026-03-26 Migrated to httpOnly cookie via Next.js API routes.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const LEGACY_TOKEN_KEY = "urbannest_auth_token";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  signOut: () => void;
  openLoginModal: boolean;
  setOpenLoginModal: (open: boolean) => void;
  /** Set intended redirect URL before triggering WhatsApp auth */
  setRedirectUrl: (url: string | null) => void;
  redirectUrl: string | null;
  /** Complete WhatsApp auth by exchanging phone for JWT */
  completeWhatsAppAuth: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchTokenFromCookie(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

async function persistTokenToCookie(token: string): Promise<void> {
  await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include",
  });
}

async function clearTokenFromCookie(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

function clearLegacyLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [redirectUrl, setRedirectUrlState] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate auth state from httpOnly cookie via server API route
    fetchTokenFromCookie().then((t) => {
      setTokenState(t);
      setMounted(true);
      // Migrate any pre-existing localStorage token to cookie on first load
      if (!t && typeof window !== "undefined") {
        try {
          const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
          if (legacy) {
            persistTokenToCookie(legacy).then(() => {
              setTokenState(legacy);
              clearLegacyLocalStorage();
            });
          }
        } catch {
          // ignore
        }
      } else if (t) {
        clearLegacyLocalStorage();
      }
    });
  }, []);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    if (value) {
      persistTokenToCookie(value).catch(() => {});
    } else {
      clearTokenFromCookie().catch(() => {});
    }
  }, []);

  const signOut = useCallback(() => {
    setTokenState(null);
    clearTokenFromCookie().catch(() => {});
    clearLegacyLocalStorage();
  }, []);

  const setRedirectUrl = useCallback((url: string | null) => {
    setRedirectUrlState(url);
  }, []);

  /**
   * After WhatsApp QR scan/verify, exchange phone for JWT token.
   * On success, store token and redirect to intended URL.
   * Uses the existing /api/auth/login route with the phone number.
   */
  const completeWhatsAppAuth = useCallback(async (phone: string) => {
    try {
      const res = await fetch("/api/auth/whatsapp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      const jwt = data?.token ?? data?.accessToken ?? data?.jwt;
      if (!jwt) throw new Error("No token returned");
      setTokenState(jwt);
      await persistTokenToCookie(jwt);
      setOpenLoginModal(false);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setOpenLoginModal(false);
      throw err;
    }
  }, [redirectUrl]);

  const value: AuthContextValue = {
    token: mounted ? token : null,
    isAuthenticated: Boolean(mounted && token),
    setToken,
    signOut,
    openLoginModal,
    setOpenLoginModal,
    setRedirectUrl,
    redirectUrl,
    completeWhatsAppAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
