/**
 * @file seo.ts
 * @module lib
 * @description Centralised SEO helpers — generateMetadata, OG tags, JSON-LD structured data.
 * @author BharatERP
 * @created 2025-03-19
 */

import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://urbannest.ai";
const SITE_NAME = "KonKreet";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

export interface PageSeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path = "",
  image = DEFAULT_IMAGE,
  noIndex = false,
  keywords = [],
}: PageSeoProps): Metadata {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes("KonKreet") ? title : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "real estate India",
      "property search India",
      "buy flat India",
      "rent apartment India",
      "AI property search",
      ...keywords,
    ].join(", "),
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      // Add @handle when KonKreet social profiles are live
    },
  };
}

/** JSON-LD: RealEstateListing structured data for property detail pages */
export function propertyJsonLd(p: {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number | null;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: p.url,
    image: p.imageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: p.location,
      addressCountry: "IN",
    },
    ...(p.bedrooms !== undefined && { numberOfRooms: p.bedrooms }),
    ...(p.areaSqft !== undefined && p.areaSqft !== null && {
      floorSize: { "@type": "QuantitativeValue", value: p.areaSqft, unitCode: "FTK" },
    }),
  };
}

/** JSON-LD: Organization for homepage */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "India's AI-powered real estate platform. Search, buy, rent, and invest with intelligence.",
  sameAs: [] as string[],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
  },
};

/** JSON-LD: SearchAction for sitelinks searchbox */
export const searchActionJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?city={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/** JSON-LD: FAQPage for common real estate questions */
export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does KonKreet AI property search work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KonKreet uses advanced AI to understand natural language queries. Describe what you want — BHK count, budget, preferred locality, proximity to schools or metro — and our AI finds the best matching properties across 340+ Indian cities.",
      },
    },
    {
      "@type": "Question",
      name: "Is it free to post a property on KonKreet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Individual owners get one free listing. Professional and Builder Pro plans are available for agents and developers who need multiple listings.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the AI price forecast?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our AI forecast analyses demand signals, infrastructure projects, and historical trends. It is intended as a directional guide and not financial advice. We recommend consulting a registered advisor before investing.",
      },
    },
  ],
};
