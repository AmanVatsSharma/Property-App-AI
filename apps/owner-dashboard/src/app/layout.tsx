/**
 * File:        src/app/layout.tsx
 * Module:      Owner Dashboard — App Shell
 * Purpose:     Root layout with Next.js providers (TanStack Query, theme)
 *
 * Exports:
 *   - RootLayout                      — wraps app with all providers
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "UrbanNest Admin",
  description: "Platform owner dashboard for UrbanNest.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
