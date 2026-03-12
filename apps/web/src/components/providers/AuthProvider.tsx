/**
 * @file AuthProvider.tsx
 * @module providers
 * @description Auth state and token for OTP sign-in; token stored in localStorage.
 * @author BharatERP
 * @created 2025-03-12
 */

"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const TOKEN_KEY = "urbannest_auth_token";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  signOut: () => void;
  openLoginModal: boolean;
  setOpenLoginModal: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function persistToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  useEffect(() => {
    setTokenState(readToken());
    setMounted(true);
  }, []);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    persistToken(value);
  }, []);

  const signOut = useCallback(() => {
    setTokenState(null);
    persistToken(null);
  }, []);

  const value: AuthContextValue = {
    token: mounted ? token : null,
    isAuthenticated: Boolean(mounted && token),
    setToken,
    signOut,
    openLoginModal,
    setOpenLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
