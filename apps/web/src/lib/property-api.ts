/**
 * @file property-api.ts
 * @module lib
 * @description Property fetch helpers; uses GraphQL API only; no mock data.
 * @author BharatERP
 * @created 2025-03-10
 */

import { logger } from "./logger";
import { gqlProperty, type ApiProperty } from "./graphql-client";

export interface PropertyDetail {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerSqft: string;
  badges: { label: string; variant: string }[];
  quickSpecs: { icon: string; val: string; label: string }[];
  overview: { label: string; val: string; green?: boolean }[];
  aiScore: number;
  aiScoreLabel: string;
  coverImage?: string;
  galleryImages?: string[];
}

function apiPropertyToDetail(p: ApiProperty): PropertyDetail {
  const priceStr = p.price >= 1_00_00_000 ? `₹${(p.price / 1_00_00_000).toFixed(2)} Cr` : `₹${(p.price / 1_00_000).toFixed(0)} L`;
  const pricePerSqft = p.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString()} / sq.ft` : "—";
  return {
    id: p.id,
    title: p.title,
    address: p.location,
    price: priceStr,
    pricePerSqft,
    badges: [
      ...(p.aiScore && p.aiScore >= 90 ? [{ label: "✦ AI Pick", variant: "badge-teal" as const }] : []),
      { label: "✓ RERA Verified", variant: "badge-green" as const },
    ],
    quickSpecs: [
      { icon: "🛏", val: `${p.bedrooms} BHK`, label: "Bedrooms" },
      { icon: "🚿", val: String(p.bathrooms), label: "Bathrooms" },
      { icon: "📐", val: p.areaSqft?.toLocaleString() ?? "—", label: "Sq.ft" },
      { icon: "📅", val: p.status ?? "—", label: "Status" },
    ],
    overview: [
      { label: "Project", val: p.title },
      { label: "Location", val: p.location },
      { label: "RERA No.", val: "—", green: false },
    ],
    aiScore: p.aiScore ?? 0,
    aiScoreLabel: p.aiTip ?? "—",
    coverImage: p.coverImageUrl ?? undefined,
    galleryImages: p.imageUrls ?? undefined,
  };
}

/** Resolve property by id or slug; returns null if not found or API not configured. */
export async function getPropertyById(idOrSlug: string): Promise<PropertyDetail | null> {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/graphql` : "");
  if (!graphqlUrl) {
    logger.warn("getPropertyById: GraphQL URL not configured");
    return null;
  }
  try {
    const p = await gqlProperty(idOrSlug);
    if (p) return apiPropertyToDetail(p);
    return null;
  } catch (e) {
    logger.warn("getPropertyById GraphQL failed", e);
    return null;
  }
}
