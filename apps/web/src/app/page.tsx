/**
 * @file page.tsx
 * @module app
 * @description Landing page — KonKreet
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = buildMetadata({
  title: "KonKreet — India's AI-Powered Real Estate Platform",
  description:
    "Search 2.4M+ verified properties with AI. Get price intelligence, neighbourhood scores, and legal checks across 340+ Indian cities.",
  path: "/",
  keywords: ["buy property India", "rent flat India", "property investment India"],
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
