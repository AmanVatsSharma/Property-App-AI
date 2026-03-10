/**
 * @file ThemeProvider.tsx
 * @module providers
 * @description Client wrapper for next-themes; provides class-based light/dark theme to html
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="urbannest-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
