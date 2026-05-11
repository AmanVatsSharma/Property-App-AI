/**
 * @file PropertyCard.tsx
 * @module search
 * @description World-class property card: hover lift/glow, FOMO "viewing" counter,
 *              price drop badge, EMI hint, quick-action slide-up, verified badge.
 *              Full light + dark support via CSS variable tokens.
 * @author BharatERP
 * @created 2025-03-19
 * @updated 2026-03-26
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, type ReactNode } from "react";
import type { ApiProperty } from "@/lib/graphql-client";
import { DEMO_IMAGES } from "@/lib/demo-images";

interface ImageWrapProps {
  src: string;
  alt: string;
  hovered: boolean;
  onError: () => void;
  priceLabel: string;
  isRent: boolean;
  saved: boolean;
  aiPick: boolean;
  isNew: boolean;
  hasPriceDrop: boolean;
  priceDropPct: number;
  isVerified: boolean;
  aiScore: number | null | undefined;
  scoreColor: string;
  viewingCount: number;
  onHeartClick: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  propertyId: string;
}

function PropertyImageArea({
  src, alt, hovered, onError, priceLabel, isRent, saved, aiPick, isNew,
  hasPriceDrop, priceDropPct, isVerified, aiScore, scoreColor, viewingCount, onHeartClick, onShare, propertyId,
}: ImageWrapProps): React.JSX.Element {
  return (
    <div className="pc-img-wrap" style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 0, right: 0, bottom: 0, left: 0,
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.5s ease-out",
        }}
      >
        <Image src={src} alt={alt} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="pc-img" onError={onError} unoptimized />
      </div>
      <div className="pc-img-scrim" />
      <div className="pc-price-tag">
        <span className="pc-price">{priceLabel}</span>
        {isRent && <span className="pc-listing-for">/mo</span>}
      </div>
      <button type="button" className={`pc-heart${saved ? " pc-heart--saved" : ""}`} onClick={onHeartClick} aria-label={saved ? "Remove from saved" : "Save property"} aria-pressed={saved}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" aria-hidden="true" style={{ transition: "transform 0.25s", transform: saved ? "scale(1.15)" : "scale(1)" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <div className="pc-badges">
        {aiPick && <span className="pc-badge pc-badge--ai animate-glow-pulse">✦ AI Pick</span>}
        {isNew && <span className="pc-badge pc-badge--new">New</span>}
        {hasPriceDrop && <span className="pc-badge pc-badge--price-drop">↓ {priceDropPct}% Drop</span>}
      </div>
      {isVerified && (
        <div style={{ position: "absolute", bottom: 8, left: 10, background: "rgba(74,222,128,0.18)", border: "1px solid rgba(74,222,128,0.35)", borderRadius: 100, padding: "2px 9px", fontSize: 10, fontWeight: 700, color: "var(--green)", zIndex: 3, backdropFilter: "blur(8px)" }}>
          ✓ Verified
        </div>
      )}
      {aiScore != null && (
        <div className="pc-score" style={{ "--score-color": scoreColor } as React.CSSProperties} aria-label={`AI Score ${aiScore}`}>{aiScore}</div>
      )}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(8,12,20,0.95))",
          padding: "24px 12px 10px",
          display: "flex", gap: 8, justifyContent: "flex-end", zIndex: 4,
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          opacity: hovered ? 1 : 0,
          transition: "transform 0.22s ease-out, opacity 0.22s ease-out",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <button type="button" onClick={onShare} aria-label="Share property" style={{ padding: "6px 12px", borderRadius: 8, background: "var(--glass)", border: "1px solid var(--glass-border)", color: "var(--text-muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 4 }}>
          <span aria-hidden="true">↗</span> Share
        </button>
        <Link href={`/property/${propertyId}`} onClick={(e) => e.stopPropagation()} style={{ padding: "6px 12px", borderRadius: 8, background: "var(--teal-dim)", border: "1px solid rgba(0,212,170,0.3)", color: "var(--teal)", fontSize: 11, fontWeight: 700, textDecoration: "none", backdropFilter: "blur(12px)" }}>
          View Details →
        </Link>
      </div>
      <div className="pc-viewing" aria-live="polite">
        <div className="pc-viewing-dot" aria-hidden="true" />
        {viewingCount} viewing now
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────────── */

function fmtPrice(p: number): string {
  if (p >= 1_00_00_000) return `₹${(p / 1_00_00_000).toFixed(2)} Cr`;
  if (p >= 1_00_000) return `₹${(p / 1_00_000).toFixed(0)}L`;
  return `₹${p.toLocaleString("en-IN")}`;
}

/** Rough EMI estimate at 8.5% for 20 years. */
function emiMonthly(price: number): string {
  const r = 0.085 / 12;
  const n = 240;
  const loanAmount = price * 0.8; // assume 20% down-payment
  const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  if (emi >= 1_00_000) return `₹${(emi / 1_00_000).toFixed(1)}L/mo`;
  if (emi >= 1_000) return `₹${Math.round(emi / 1000)}K/mo`;
  return `₹${Math.round(emi).toLocaleString("en-IN")}/mo`;
}

/** Deterministic "viewing count" seeded from listing id — stable per session. */
function viewingCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash % 6) + 2; // 2–7
}

/* ── props ────────────────────────────────────────────────────────── */

interface Props {
  property: ApiProperty;
  onHeartClick?: (id: string, saved: boolean) => void;
  initialSaved?: boolean;
}

/* ── component ────────────────────────────────────────────────────── */

export function PropertyCard({ property: p, onHeartClick, initialSaved = false }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cover = !imgErr && p.coverImageUrl ? p.coverImageUrl : DEMO_IMAGES.defaultPropertyCover;

  const scoreColor =
    p.aiScore == null
      ? "var(--text-muted)"
      : p.aiScore >= 85
        ? "var(--teal)"
        : p.aiScore >= 70
          ? "var(--gold)"
          : "var(--coral)";

  const createdDaysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86_400_000);
  const viewing = useMemo(() => (p.viewCount && p.viewCount > 0 ? p.viewCount : viewingCount(p.id)), [p.id, p.viewCount]);
  const emi = useMemo(() => (p.listingFor !== "rent" ? emiMonthly(p.price) : null), [p.price, p.listingFor]);

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onHeartClick?.(p.id, next);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.share({ title: p.title, url: `/property/${p.id}` });
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/property/${p.id}`);
    }
  };

  return (
    <div
      className="pc-root"
      data-testid={`prop-card-${p.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "box-shadow 0.3s, transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
        display: "block",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <Link
        href={`/property/${p.id}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
        aria-label={`View ${p.title}`}
      >
        {/* ── Image area ── */}
        <PropertyImageArea
          src={cover}
          alt={p.title}
          hovered={hovered}
          onError={() => setImgErr(true)}
          priceLabel={fmtPrice(p.price)}
          isRent={p.listingFor === "rent"}
          saved={saved}
          aiPick={p.aiScore != null && p.aiScore >= 90}
          isNew={createdDaysAgo <= 3}
          hasPriceDrop={p.priceDropPercent != null && p.priceDropPercent > 0}
          priceDropPct={p.priceDropPercent ?? 0}
          isVerified={!!p.isVerified}
          aiScore={p.aiScore}
          scoreColor={scoreColor}
          viewingCount={viewing}
          onHeartClick={handleHeart}
          onShare={handleShare}
          propertyId={p.id}
        />

        {/* ── Card body ── */}
        <div className="pc-body">
          <div className="pc-location">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {p.location.split(",")[0]?.trim()}
          </div>

          <div className="pc-title">{p.title}</div>

          <div className="pc-specs">
            {p.bedrooms > 0 && <span className="pc-spec">{p.bedrooms} BHK</span>}
            {p.bathrooms > 0 && <span className="pc-spec">{p.bathrooms} Bath</span>}
            {p.areaSqft != null && p.areaSqft > 0 && (
              <span className="pc-spec">{Math.round(p.areaSqft).toLocaleString()} sqft</span>
            )}
            {p.type && <span className="pc-spec-type">{p.type}</span>}
          </div>

          {/* EMI hint */}
          {emi && (
            <div className="emi-hint">≈ {emi} EMI est.</div>
          )}

          {/* AI tip */}
          {p.aiTip && (
            <div className="pc-ai-tip">
              <span className="pc-ai-icon" aria-hidden>✦</span>
              {p.aiTip.length > 85 ? `${p.aiTip.slice(0, 82)}…` : p.aiTip}
            </div>
          )}

        </div>
      </Link>
    </div>
  );
}
