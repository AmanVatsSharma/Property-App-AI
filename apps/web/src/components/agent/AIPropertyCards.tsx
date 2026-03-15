/**
 * @file AIPropertyCards.tsx
 * @module agent
 * @description Renders compact property cards from AI response sources (property IDs).
 * @author BharatERP
 * @created 2025-03-15
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { gqlProperty, type ApiProperty } from "@/lib/graphql-client";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { DEMO_IMAGES } from "@/lib/demo-images";

export interface AIPropertyCardsProps {
  /** Source entries with type 'property' and id. */
  sources: Array<{ type: string; label: string; id?: string }>;
  className?: string;
  "data-testid"?: string;
}

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

export function AIPropertyCards({
  sources,
  className,
  "data-testid": dataTestId = "ai-property-cards",
}: AIPropertyCardsProps) {
  const propertyIds = sources
    .filter((s) => s.type === "property" && s.id)
    .map((s) => s.id as string);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyIds.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(propertyIds.map((id) => gqlProperty(id)))
      .then((results) => {
        if (!cancelled) {
          setProperties(results.filter((p): p is ApiProperty => p != null));
        }
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [propertyIds.join(",")]);

  if (propertyIds.length === 0) return null;
  if (loading) {
    return (
      <div className={className} data-testid={dataTestId}>
        <p className="text-xs text-(--text-muted)">Loading properties…</p>
      </div>
    );
  }
  if (properties.length === 0) return null;

  return (
    <div
      className={`mt-3 space-y-2 ${className ?? ""}`}
      data-testid={dataTestId}
    >
      <p className="text-xs font-medium text-(--text-muted)">Properties found</p>
      <div className="grid gap-2">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="flex gap-3 rounded-lg bg-(--dark-2) border border-(--border) p-2 text-left hover:border-(--teal)/50 transition-colors"
            data-testid={`ai-property-card-${p.id}`}
          >
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
              <PropertyImage
                src={p.coverImageUrl ?? DEMO_IMAGES.defaultPropertyCover}
                alt={p.title}
                className="object-cover"
                sizes="80px"
                placeholderGradient="linear-gradient(135deg,#132238,#1e3a5f)"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">
                {p.title}
              </div>
              <div className="text-xs text-(--text-muted) truncate">
                {p.location}
              </div>
              <div className="text-xs font-medium text-(--teal) mt-0.5">
                {formatPrice(p.price)}
                {p.bedrooms ? ` · ${p.bedrooms} BHK` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
