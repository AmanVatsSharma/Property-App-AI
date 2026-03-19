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
import MobileAppPrompt from "@/components/layout/MobileAppPrompt";
import RevealObserver from "@/components/ui/RevealObserver";
import { SkipToContent, MAIN_CONTENT_ID } from "@/components/ui/SkipToContent";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AIFabProvider } from "@/components/providers/AIFabProvider";
import { ToastProvider } from "@/components/ui/Toast";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ServiceWorkerInit from "@/components/layout/ServiceWorkerInit";
import { organizationJsonLd, searchActionJsonLd } from "@/lib/seo";

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://urbannest.ai";

export const metadata: Metadata = {
  title: {
    default: "UrbanNest.ai — India's Smartest Real Estate Platform",
    template: "%s — UrbanNest.ai",
  },
  description:
    "AI-powered property search, price intelligence and neighbourhood scoring across 340+ Indian cities. Buy, rent and invest smarter.",
  keywords:
    "real estate India, property search, buy flat, rent apartment, AI property, RERA verified",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "UrbanNest.ai",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", site: "@urbannestai" },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UrbanNest.ai",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-192.png", sizes: "192x192" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080c14" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
  ],
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
          <ToastProvider>
          <SkipToContent />
          <AnnouncementBar />
          <Nav />
          <main id={MAIN_CONTENT_ID} tabIndex={-1}>
            <MobileAppPrompt />
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <AIFab />
          <RevealObserver />
          </ToastProvider>
          </AIFabProvider>
          </AuthProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionJsonLd) }}
        />
        <ServiceWorkerInit />
      </body>
    </html>
  );
}
