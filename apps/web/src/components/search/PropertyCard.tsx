/**
 * @file PropertyCard.tsx
 * @module search
 * @description Premium property card v2 with hover effects, heart toggle, AI score.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { DEMO_IMAGES } from "@/lib/demo-images";
import type { ApiProperty } from "@/lib/graphql-client";

function formatPrice(price: number): string {
  return price >= 1_00_00_000
    ? `₹${(price / 1_00_00_000).toFixed(2)} Cr`
    : `₹${(price / 1_00_000).toFixed(0)} L`;
}

interface PropertyCardProps {
  property: ApiProperty;
  onHeartClick?: (id: string, saved: boolean) => void;
  initialSaved?: boolean;
}

export function PropertyCard({
  property: p,
  onHeartClick,
  initialSaved = false,
}: PropertyCardProps) {
  const [saved, setSaved] = useState(initialSaved);

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onHeartClick?.(p.id, next);
  };

  return (
    <Link
      href={`/property/${p.id}`}
      className="prop-card-v2"
      data-testid={`prop-card-${p.id}`}
    >
      <div className="card-img-wrap">
        <PropertyImage
          src={p.coverImageUrl ?? DEMO_IMAGES.defaultPropertyCover}
          alt={p.title}
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="card-gradient" />
        <div className="card-overlay-price">{formatPrice(p.price)}</div>
        <div className="card-overlay-loc">
          <span aria-hidden>📍</span>
          <span>{p.location.split(",")[0]}</span>
        </div>
        <button
          type="button"
          className="card-heart"
          onClick={handleHeart}
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          {saved ? "❤️" : "♡"}
        </button>
        {p.aiScore != null && p.aiScore > 0 && (
          <div className="card-ai-score">
            <div className="score-n">{p.aiScore}</div>
            <div className="score-l">AI</div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: saved ? 56 : 12,
            display: "flex",
            gap: 5,
            zIndex: 2,
            flexWrap: "wrap",
          }}
        >
          {p.aiScore != null && p.aiScore >= 90 && (
            <span className="badge badge-teal" style={{ fontSize: 10 }}>
              ✦ AI Pick
            </span>
          )}
          {p.isFreeListing && (
            <span className="badge badge-green" style={{ fontSize: 10 }}>
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-title">{p.title}</div>
        <div className="card-specs">
          {p.bedrooms > 0 && (
            <span className="card-spec">
              <span aria-hidden>🛏</span>
              {p.bedrooms} BHK
            </span>
          )}
          {p.bathrooms > 0 && (
            <span className="card-spec">
              <span aria-hidden>🚿</span>
              {p.bathrooms}
            </span>
          )}
          {p.areaSqft != null && p.areaSqft > 0 && (
            <span className="card-spec">
              <span aria-hidden>📐</span>
              {p.areaSqft.toLocaleString()}
            </span>
          )}
          {p.type && (
            <span
              className="card-spec"
              style={{ marginLeft: "auto", textTransform: "capitalize" }}
            >
              {p.type}
            </span>
          )}
        </div>
        {p.aiTip && (
          <div className="card-ai-badge">
            <strong style={{ color: "var(--teal)" }}>✦ AI:</strong> {p.aiTip}
          </div>
        )}
      </div>
    </Link>
  );
}
