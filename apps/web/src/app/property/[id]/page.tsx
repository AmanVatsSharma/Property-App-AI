/**
 * @file page.tsx
 * @module app/property/[id]
 * @description Dynamic property detail page; fetches by id. Server component renders
 *              gallery + structured data; PropertyDetailClient handles interactive UI.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/property-api";
import { buildMetadata, propertyJsonLd } from "@/lib/seo";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyDetailClient } from "@/components/property/PropertyDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://urbannest.ai";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: "Property Not Found — KonKreet" };
  const description = `${property.title} in ${property.address}. ${property.price}. ${property.quickSpecs.map((s) => s.val).join(", ")}. View full details, AI score, and contact owner.`;
  return buildMetadata({
    title: property.title,
    description,
    path: `/property/${id}`,
    image: property.coverImage,
    keywords: [property.address, "property for sale India", "flat for rent India"],
  });
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const numericPrice = Number(property.price.replace(/[^0-9.]/g, "")) || 0;
  const bedroomsSpec = property.quickSpecs.find((q) => q.label === "Bedrooms");
  const bedrooms = bedroomsSpec ? parseInt(bedroomsSpec.val, 10) : undefined;
  const areaSpec = property.quickSpecs.find((q) => q.label === "Sq.ft");
  const areaSqft = areaSpec ? parseInt(areaSpec.val.replace(/,/g, ""), 10) : undefined;

  const jsonLd = propertyJsonLd({
    id: property.id,
    title: property.title,
    description: `${property.title} in ${property.address}`,
    price: numericPrice,
    location: property.address,
    imageUrl: property.coverImage,
    url: `${BASE_URL}/property/${property.id}`,
    bedrooms: Number.isNaN(bedrooms) ? undefined : bedrooms,
    areaSqft: Number.isNaN(areaSqft) ? undefined : (areaSqft ?? undefined),
  });

  /* Derive city from address for breadcrumb (no hardcoded "Buy in Gurgaon") */
  const city = property.address.split(",").slice(-2)[0]?.trim() ?? property.address.split(",")[0]?.trim() ?? "India";
  const shortTitle = property.title.split("—")[0]?.trim() ?? property.title;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-wrap">
        {/* Gallery + breadcrumb header */}
        <div
          className="detail-top-wrap"
          style={{ padding: "20px 52px 0", background: "var(--dark)", borderBottom: "1px solid var(--border)" }}
        >
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <Link href={`/search?location=${encodeURIComponent(city)}`}>
              Properties in {city}
            </Link>
            <span aria-hidden>/</span>
            <span style={{ color: "var(--text-muted)" }} aria-current="page">{shortTitle}</span>
          </nav>
          <PropertyGallery
            coverImage={property.coverImage}
            galleryImages={property.galleryImages}
            title={property.title}
          />
        </div>

        {/* All interactive content (sticky header, tabs, sidebar, similar) */}
        <PropertyDetailClient property={property} />
      </div>
    </>
  );
}
