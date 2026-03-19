/**
 * @file PropertyCard.tsx
 * @module search
 * @description Premium property card with pc-* design system, glass price tag, heart, AI score.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ApiProperty } from "@/lib/graphql-client";
import { DEMO_IMAGES } from "@/lib/demo-images";

function fmtPrice(p: number): string {
  if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(2)} Cr`;
  if (p >= 1_00_000) return `₹${(p / 1_00_000).toFixed(0)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
}

interface Props {
  property: ApiProperty;
  onHeartClick?: (id: string, saved: boolean) => void;
  initialSaved?: boolean;
}

export function PropertyCard({ property: p, onHeartClick, initialSaved = false }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [imgErr, setImgErr] = useState(false);

  const cover =
    !imgErr && p.coverImageUrl ? p.coverImageUrl : DEMO_IMAGES.defaultPropertyCover;

  const scoreColor =
    p.aiScore == null
      ? "var(--text-muted)"
      : p.aiScore >= 85
        ? "var(--teal)"
        : p.aiScore >= 70
          ? "var(--gold)"
          : "var(--coral)";

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onHeartClick?.(p.id, next);
  };

  const createdDaysAgo = Math.floor(
    (Date.now() - new Date(p.createdAt).getTime()) / 86_400_000,
  );

  return (
    <Link
      href={`/property/${p.id}`}
      className="pc-root"
      data-testid={`prop-card-${p.id}`}
    >
      {/* ── Image ── */}
      <div className="pc-img-wrap">
        <Image
          src={cover}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="pc-img"
          onError={() => setImgErr(true)}
          unoptimized
        />
        <div className="pc-img-scrim" />

        {/* Price overlay */}
        <div className="pc-price-tag">
          <span className="pc-price">{fmtPrice(p.price)}</span>
          {p.listingFor === "rent" && <span className="pc-listing-for">/mo</span>}
        </div>

        {/* Heart */}
        <button
          type="button"
          className={`pc-heart${saved ? " pc-heart--saved" : ""}`}
          onClick={handleHeart}
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Badges */}
        <div className="pc-badges">
          {p.aiScore != null && p.aiScore >= 90 && (
            <span className="pc-badge pc-badge--ai">✦ AI Pick</span>
          )}
          {createdDaysAgo <= 3 && (
            <span className="pc-badge pc-badge--new">New</span>
          )}
        </div>

        {/* AI score */}
        {p.aiScore != null && (
          <div
            className="pc-score"
            style={{ "--score-color": scoreColor } as React.CSSProperties}
            aria-label={`AI Score ${p.aiScore}`}
          >
            {p.aiScore}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="pc-body">
        <div className="pc-location">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {p.location.split(",")[0]?.trim()}
        </div>

        <div className="pc-title">{p.title}</div>

        <div className="pc-specs">
          {p.bedrooms > 0 && <span className="pc-spec">{p.bedrooms} BHK</span>}
          {p.bathrooms > 0 && (
            <span className="pc-spec">{p.bathrooms} Bath</span>
          )}
          {p.areaSqft != null && p.areaSqft > 0 && (
            <span className="pc-spec">
              {Math.round(p.areaSqft).toLocaleString()} sqft
            </span>
          )}
          {p.type && <span className="pc-spec-type">{p.type}</span>}
        </div>

        {p.aiTip && (
          <div className="pc-ai-tip">
            <span className="pc-ai-icon" aria-hidden>
              ✦
            </span>
            {p.aiTip.length > 85 ? `${p.aiTip.slice(0, 82)}…` : p.aiTip}
          </div>
        )}
      </div>
    </Link>
  );
}
