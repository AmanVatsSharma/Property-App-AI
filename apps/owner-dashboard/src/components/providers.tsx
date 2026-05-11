/**
 * File:        src/components/providers.tsx
 * Module:      Owner Dashboard — Providers
 * Purpose:     Next.js providers: TanStack Query client
 *
 * Exports:
 *   - Providers                       — wraps app with QueryClientProvider
 *
 * Depends on:
 *   - @tanstack/react-query          — data fetching
 *
 * Side-effects:
 *   - client-side only (QueryClient lives here)
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
