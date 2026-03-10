/**
 * @file property-api.ts
 * @module lib
 * @description Property fetch helpers; uses API when available, mock otherwise
 * @author BharatERP
 * @created 2025-03-10
 */

import { apiGet } from "./api-client";
import { logger } from "./logger";

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
  },
};

/** Resolve property by id or slug; returns null if not found */
export async function getPropertyById(idOrSlug: string): Promise<PropertyDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (baseUrl) {
    try {
      const data = await apiGet<PropertyDetail>(`/properties/${encodeURIComponent(idOrSlug)}`);
      return data ?? null;
    } catch (e) {
      logger.warn("getPropertyById API failed, using mock", e);
    }
  }
  const normalized = idOrSlug.toLowerCase().replace(/\s+/g, "-");
  const key = normalized === "detail" ? "sobha-city-vista" : normalized;
  return MOCK_PROPERTIES[key] ?? null;
}
