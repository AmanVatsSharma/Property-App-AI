/**
 * File:        apps/web/src/app/compare/page.tsx
 * Module:      Web · Compare Properties (route)
 * Purpose:     Premium side-by-side property comparison page. Reads `?ids=a,b,c`
 *              from URL, server-fetches each listing in parallel, hands off to
 *              the interactive client. Showcases the agent's `compare_properties`
 *              tool through a dedicated, conversion-oriented surface.
 *
 * Exports:
 *   - generateMetadata({ searchParams })  — dynamic SEO based on selection
 *   - default ComparePage                 — Next.js App Router server component
 *
 * Depends on:
 *   - @/lib/graphql-client (gqlProperty)  — single-property fetch
 *   - @/lib/seo (buildMetadata)           — Open Graph / Twitter card builder
 *   - @/components/compare/CompareClient  — interactive comparison UI
 *
 * Side-effects:
 *   - GraphQL reads (one per id, parallel via Promise.allSettled).
 *
 * Key invariants:
 *   - Caps comparison set to 5 properties (matches agent compare_properties
 *     tool's max input).
 *   - De-duplicates ids before fetching.
 *   - Missing/failed fetches are silently dropped — they show as "removed"
 *     in the empty selection grid rather than crashing the page.
 *
 * Read order:
 *   1. parseIds()                — query parsing
 *   2. ComparePage()              — fetch + render
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import type { Metadata } from "next";
import { gqlProperty, type ApiProperty } from "@/lib/graphql-client";
import { buildMetadata } from "@/lib/seo";
import { CompareClient } from "@/components/compare/CompareClient";

const MAX_COMPARE = 5;

interface PageProps {
  searchParams: Promise<{ ids?: string | string[] }>;
}

function parseIds(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const flat = Array.isArray(raw) ? raw.join(",") : raw;
  const ids = flat
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(ids)).slice(0, MAX_COMPARE);
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const ids = parseIds(sp.ids);
  return buildMetadata({
    title:
      ids.length >= 2
        ? `Compare ${ids.length} Properties — UrbanNest.ai`
        : "Compare Properties — UrbanNest.ai",
    description:
      "Side-by-side comparison of up to 5 properties with AI verdict, area scores, price-per-sqft, and verified-listing signals.",
    path: "/compare",
    keywords: [
      "compare properties India",
      "side by side property comparison",
      "AI property comparison",
    ],
  });
}

export default async function ComparePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const ids = parseIds(sp.ids);

  let properties: ApiProperty[] = [];
  if (ids.length > 0) {
    const settled = await Promise.allSettled(ids.map((id) => gqlProperty(id)));
    properties = settled
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((p): p is ApiProperty => Boolean(p));
  }

  return (
    <main id="main-content" className="page-wrap">
      <CompareClient initialProperties={properties} initialIds={ids} maxCompare={MAX_COMPARE} />
    </main>
  );
}
