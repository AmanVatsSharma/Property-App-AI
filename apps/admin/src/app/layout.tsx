/**
 * @file layout.tsx
 * @module admin/app
 * @description Root layout for admin panel.
 * @author BharatERP
 * @created 2025-03-13
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — Property Listing",
  description: "Admin panel for property listing SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
