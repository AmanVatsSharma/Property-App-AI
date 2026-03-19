/**
 * @file page.tsx
 * @module app/search
 * @description Search properties page
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Search Properties",
  description:
    "Search and filter 2.4M+ verified Indian properties by city, BHK, budget, and type. AI-powered matching across Mumbai, Bangalore, Delhi NCR, and 340+ cities.",
  path: "/search",
  keywords: [
    "property search India",
    "buy flat Bangalore",
    "rent apartment Mumbai",
    "2BHK Delhi",
  ],
});

export default function SearchPage() {
  return (
    <div className="page-wrap">
      <SearchPageClient />
    </div>
  );
}
