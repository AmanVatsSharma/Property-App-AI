/**
 * @file sitemap.ts
 * @module app
 * @description Dynamic XML sitemap; static routes + top property listings.
 * @author BharatERP
 * @created 2025-03-19
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://urbannest.ai";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: `${BASE_URL}/post-property`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/neighbourhood`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE_URL}/price-forecast`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${BASE_URL}/emi-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/legal-checker`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/trust`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

async function fetchTopProperties(): Promise<MetadataRoute.Sitemap> {
  const graphqlUrl = process.env.API_GRAPHQL_HTTP ?? process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? "";
  if (!graphqlUrl) return [];

  try {
    const res = await fetch(graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { properties(filter: { limit: 200, sortBy: "createdAt", sortOrder: "desc" }) { id updatedAt } }`,
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { properties?: Array<{ id: string; updatedAt: string }> };
    };

    return (data.data?.properties ?? []).map((p) => ({
      url: `${BASE_URL}/property/${p.id}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const propertyRoutes = await fetchTopProperties();
  return [...STATIC_ROUTES, ...propertyRoutes];
}
