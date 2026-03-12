/**
 * @file property-api.ts
 * @module lib
 * @description Property fetch helpers; uses GraphQL API when available, mock otherwise
 * @author BharatERP
 * @created 2025-03-10
 */

import { DEMO_IMAGES } from "./demo-images";
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

const MOCK_PROPERTIES: Record<string, PropertyDetail> = {
  "sobha-city-vista": {
    id: "sobha-city-vista",
    title: "Sobha City Vista — 4 BHK Ultra Luxury Apartment",
    address: "Sector 108, Dwarka Expressway, Gurgaon, Haryana 122017",
    price: "₹2.85 Cr",
    pricePerSqft: "₹10,000 / sq.ft",
    badges: [
      { label: "⭐ Premium", variant: "badge-gold" },
      { label: "✦ AI Pick", variant: "badge-teal" },
      { label: "✓ RERA Verified", variant: "badge-green" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "4 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "4", label: "Bathrooms" },
      { icon: "📐", val: "2,850", label: "Sq.ft" },
      { icon: "🚗", val: "2", label: "Parking" },
      { icon: "🏢", val: "14th", label: "Floor" },
      { icon: "📅", val: "Ready", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "Sobha City Vista" },
      { label: "Builder", val: "Sobha Ltd." },
      { label: "Possession", val: "Ready to Move" },
      { label: "Total Floors", val: "G + 32" },
      { label: "Facing", val: "East Facing" },
      { label: "RERA No.", val: "HRERA-PKL-NOV-...", green: true },
    ],
    aiScore: 94,
    aiScoreLabel: "Top 6% in locality",
    coverImage: DEMO_IMAGES.properties["sobha-city-vista"].cover,
    galleryImages: [...DEMO_IMAGES.properties["sobha-city-vista"].gallery],
  },
  "dlf-mypad": {
    id: "dlf-mypad",
    title: "DLF MyPad — 2 BHK Studio, Noida",
    address: "Sector 59, Noida",
    price: "₹78 L",
    pricePerSqft: "₹7,090 / sq.ft",
    badges: [
      { label: "✓ Verified", variant: "badge-green" },
      { label: "🔥 Hot", variant: "badge-coral" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "2 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "2", label: "Bathrooms" },
      { icon: "📐", val: "1,100", label: "Sq.ft" },
      { icon: "🚗", val: "1", label: "Parking" },
      { icon: "🏢", val: "8th", label: "Floor" },
      { icon: "📅", val: "Ready", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "DLF MyPad" },
      { label: "Builder", val: "DLF Ltd." },
      { label: "Possession", val: "Ready to Move" },
      { label: "Total Floors", val: "G + 15" },
      { label: "Facing", val: "North" },
      { label: "RERA No.", val: "UPRERA-...", green: true },
    ],
    aiScore: 88,
    aiScoreLabel: "Best value in locality",
    coverImage: DEMO_IMAGES.properties["dlf-mypad"].cover,
    galleryImages: [...DEMO_IMAGES.properties["dlf-mypad"].gallery],
  },
  "m3m-golf-hills": {
    id: "m3m-golf-hills",
    title: "M3M Golf Hills — 3 BHK Premium",
    address: "Sector 79, Gurgaon, Haryana",
    price: "₹1.45 Cr",
    pricePerSqft: "₹7,672 / sq.ft",
    badges: [
      { label: "NEW", variant: "badge-white" },
      { label: "✦ AI Pick", variant: "badge-teal" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "3 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "3", label: "Bathrooms" },
      { icon: "📐", val: "1,890", label: "Sq.ft" },
      { icon: "🚗", val: "1", label: "Parking" },
      { icon: "🏢", val: "12th", label: "Floor" },
      { icon: "📅", val: "Ready", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "M3M Golf Hills" },
      { label: "Builder", val: "M3M India" },
      { label: "Possession", val: "Ready to Move" },
      { label: "Total Floors", val: "G + 18" },
      { label: "Facing", val: "South" },
      { label: "RERA No.", val: "HRERA-...", green: true },
    ],
    aiScore: 91,
    aiScoreLabel: "37 views today",
    coverImage: DEMO_IMAGES.properties["m3m-golf-hills"].cover,
    galleryImages: [...DEMO_IMAGES.properties["m3m-golf-hills"].gallery],
  },
  "prestige-sunrise-park": {
    id: "prestige-sunrise-park",
    title: "Prestige Sunrise Park — 2 BHK",
    address: "Whitefield, Bangalore, Karnataka",
    price: "₹62 L",
    pricePerSqft: "₹4,960 / sq.ft",
    badges: [
      { label: "⭐ Featured", variant: "badge-gold" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "2 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "2", label: "Bathrooms" },
      { icon: "📐", val: "1,250", label: "Sq.ft" },
      { icon: "🚗", val: "1", label: "Parking" },
      { icon: "🏢", val: "6th", label: "Floor" },
      { icon: "📅", val: "RERA", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "Prestige Sunrise Park" },
      { label: "Builder", val: "Prestige Group" },
      { label: "Possession", val: "Ready to Move" },
      { label: "Total Floors", val: "G + 14" },
      { label: "Facing", val: "East" },
      { label: "RERA No.", val: "RERA-...", green: true },
    ],
    aiScore: 86,
    aiScoreLabel: "28% YoY appreciation",
    coverImage: DEMO_IMAGES.properties["prestige-sunrise-park"].cover,
    galleryImages: [...DEMO_IMAGES.properties["prestige-sunrise-park"].gallery],
  },
  "brigade-cornerstone-utopia": {
    id: "brigade-cornerstone-utopia",
    title: "Brigade Cornerstone Utopia — 3 BHK",
    address: "Yelahanka, Bangalore, Karnataka",
    price: "₹95 L",
    pricePerSqft: "₹6,013 / sq.ft",
    badges: [
      { label: "Under Construction", variant: "badge-coral" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "3 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "3", label: "Bathrooms" },
      { icon: "📐", val: "1,580", label: "Sq.ft" },
      { icon: "🚗", val: "1", label: "Parking" },
      { icon: "🏢", val: "—", label: "Floor" },
      { icon: "📅", val: "Dec 2026", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "Brigade Cornerstone Utopia" },
      { label: "Builder", val: "Brigade Group" },
      { label: "Possession", val: "Dec 2026" },
      { label: "Total Floors", val: "G + 20" },
      { label: "Facing", val: "North" },
      { label: "RERA No.", val: "RERA-...", green: true },
    ],
    aiScore: 79,
    aiScoreLabel: "Launch price",
    coverImage: DEMO_IMAGES.properties["brigade-cornerstone-utopia"].cover,
    galleryImages: [...DEMO_IMAGES.properties["brigade-cornerstone-utopia"].gallery],
  },
  "godrej-meridian": {
    id: "godrej-meridian",
    title: "Godrej Meridian — 4 BHK, Gurgaon",
    address: "Sector 106, Gurgaon, Haryana",
    price: "₹1.8 Cr",
    pricePerSqft: "₹8,182 / sq.ft",
    badges: [
      { label: "✓ Verified", variant: "badge-green" },
    ],
    quickSpecs: [
      { icon: "🛏", val: "4 BHK", label: "Bedrooms" },
      { icon: "🚿", val: "4", label: "Bathrooms" },
      { icon: "📐", val: "2,200", label: "Sq.ft" },
      { icon: "🚗", val: "2", label: "Parking" },
      { icon: "🏢", val: "9th", label: "Floor" },
      { icon: "📅", val: "Ready", label: "Status" },
    ],
    overview: [
      { label: "Project", val: "Godrej Meridian" },
      { label: "Builder", val: "Godrej Properties" },
      { label: "Possession", val: "Ready to Move" },
      { label: "Total Floors", val: "G + 24" },
      { label: "Facing", val: "Golf course" },
      { label: "RERA No.", val: "HRERA-...", green: true },
    ],
    aiScore: 83,
    aiScoreLabel: "School access score 88",
    coverImage: DEMO_IMAGES.properties["godrej-meridian"].cover,
    galleryImages: [...DEMO_IMAGES.properties["godrej-meridian"].gallery],
  },
};

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

/** Resolve property by id or slug; returns null if not found */
export async function getPropertyById(idOrSlug: string): Promise<PropertyDetail | null> {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/graphql` : "");
  if (graphqlUrl) {
    try {
      const p = await gqlProperty(idOrSlug);
      if (p) return apiPropertyToDetail(p);
    } catch (e) {
      logger.warn("getPropertyById GraphQL failed, using mock", e);
    }
  }
  const normalized = idOrSlug.toLowerCase().replace(/\s+/g, "-");
  const key = normalized === "detail" ? "sobha-city-vista" : normalized;
  return MOCK_PROPERTIES[key] ?? null;
}
