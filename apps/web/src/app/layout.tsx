/**
 * @file layout.tsx
 * @module app
 * @description Root layout — fonts, providers, nav, footer, PWA.
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
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ServiceWorkerInit from "@/components/layout/ServiceWorkerInit";
import RevealObserver from "@/components/ui/RevealObserver";
import { SkipToContent, MAIN_CONTENT_ID } from "@/components/ui/SkipToContent";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AIFabProvider } from "@/components/providers/AIFabProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { organizationJsonLd, searchActionJsonLd } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UrbanNest.ai — India's Smartest Real Estate Platform",
    template: "%s — UrbanNest.ai",
  },
  description:
    "AI-powered property search, price intelligence and neighbourhood scoring across 340+ Indian cities. Buy, rent and invest smarter.",
  keywords:
    "real estate India, property search, buy flat India, rent apartment India, AI property search, RERA verified",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://urbannest.ai"
  ),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UrbanNest.ai",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "UrbanNest.ai",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@urbannestai",
    images: ["/og-default.jpg"],
  },
  robots: { index: true, follow: true },
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${outfit.variable} ${playfair.variable} ${outfit.className} antialiased`}
      >
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

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchActionJsonLd),
          }}
        />

        {/* PWA service worker registration */}
        <ServiceWorkerInit />
      </body>
    </html>
  );
}
