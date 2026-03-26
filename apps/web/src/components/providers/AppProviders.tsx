/**
 * @file AppProviders.tsx
 * @module providers
 * @description Single client boundary for theme, auth, AI fab, and toasts — avoids Turbopack HMR ordering issues from many provider imports in the root layout.
 * @author BharatERP
 * @created 2026-03-26
 */

"use client";

import type { ReactNode } from "react";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AIFabProvider } from "@/components/providers/AIFabProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AIFabProvider>
          <ToastProvider>{children}</ToastProvider>
        </AIFabProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
