/**
 * File:        apps/web/src/app/auth/whatsapp-qr/page.tsx
 * Module:      app / auth / whatsapp-qr
 * Purpose:     Dedicated WhatsApp QR login page
 *
 * Exports:
 *   - metadata (Next.js)              — page SEO metadata
 *   - default export (Page component) — full page layout
 *
 * Depends on:
 *   - @/components/auth/WhatsAppQrLogin — the auth component
 *
 * Side-effects:
 *   - None
 *
 * Key invariants:
 *   - This is a full-page route — users land here from /auth/whatsapp-qr
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import type { Metadata } from "next";
import WhatsAppQrLogin from "@/components/auth/WhatsAppQrLogin";

export const metadata: Metadata = {
  title: "Login with WhatsApp QR - UrbanNest",
  description:
    "Scan a QR code with your WhatsApp to securely log in to UrbanNest.ai — India's AI-powered real estate platform.",
  robots: { index: false, follow: false }, // Login pages should not be indexed
};

export default function WhatsAppQrPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0e1a] dark:to-[#0f172a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#25D366]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#25D366]/5 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <WhatsAppQrLogin />

      {/* Footer note */}
      <p className="fixed bottom-6 left-0 right-0 text-center text-xs text-gray-400 dark:text-gray-600">
        By continuing, you agree to UrbanNest's{" "}
        <a href="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-400">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-400">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}