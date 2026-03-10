/**
 * @file page.tsx
 * @module app/search
 * @description Search properties page
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "Search Properties — UrbanNest.ai",
  description: "Search properties with AI. Buy, rent, new projects across 340+ Indian cities.",
};

export default function SearchPage() {
  return (
    <div className="page-wrap">
      <SearchPageClient />
    </div>
  );
}
