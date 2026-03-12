/**
 * @file layout.tsx
 * @module app
 * @description Root layout with fonts, nav, footer, AI FAB
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata, Viewport } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AIFab from "@/components/layout/AIFab";
import RevealObserver from "@/components/ui/RevealObserver";
import { SkipToContent, MAIN_CONTENT_ID } from "@/components/ui/SkipToContent";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AIFabProvider } from "@/components/providers/AIFabProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UrbanNest.ai — India's Smartest Real Estate Platform",
  description:
    "AI-powered property search, price intelligence and neighbourhood scoring across 340+ Indian cities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable} ${outfit.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
          <AIFabProvider>
          <SkipToContent />
          <AnnouncementBar />
          <Nav />
          <main id={MAIN_CONTENT_ID} tabIndex={-1}>{children}</main>
          <Footer />
          <AIFab />
          <RevealObserver />
          </AIFabProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
