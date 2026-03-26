/**
 * @file FilterSidebar.tsx
 * @module search
 * @description Premium filter sidebar: chip-based type/BHK selectors, budget presets,
 *              custom price inputs, status toggles, AI Smart Match CTA.
 *              Full light + dark mode via CSS variable tokens.
 * @author BharatERP
 * @created 2025-03-19
 * @updated 2026-03-26
 */

"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";

/* ── types ────────────────────────────────────────────────────────── */

interface Filters {
  type: string;
  bhk: string;
  minPrice: string;
  maxPrice: string;
  ready: boolean;
  verified: boolean;
}

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onAIMatch: () => void;
}

/* ── data ─────────────────────────────────────────────────────────── */

const TYPES = [
  { label: "Apartment", value: "apartment", icon: "🏢" },
  { label: "Villa", value: "villa", icon: "🏡" },
  { label: "Plot", value: "plot", icon: "🌳" },
  { label: "Builder", value: "builder-floor", icon: "🏗️" },
  { label: "Office", value: "office", icon: "💼" },
  { label: "PG/Co", value: "pg", icon: "🛏️" },
];

const BHK_OPTIONS = ["1", "2", "3", "4+"];

const BUDGET_PRESETS = [
  { label: "Under 50L", max: "5000000", min: "" },
  { label: "Under 1 Cr", max: "10000000", min: "" },
  { label: "Under 2 Cr", max: "20000000", min: "" },
  { label: "2 Cr+", min: "20000000", max: "" },
];

/* ── sub-component ─────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-dim)",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────── */

export function FilterSidebar({ filters, onChange, onAIMatch }: Props) {
  const set = useCallback((patch: Partial<Filters>) => onChange(patch), [onChange]);

  return (
    <aside className="sidebar" aria-label="Property filters">
      {/* AI Smart Match CTA */}
      <motion.div
        style={{ marginBottom: 24 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <button
          type="button"
          className="ai-match-btn"
          style={{ width: "100%", padding: "13px 0", position: "relative", overflow: "hidden" }}
          onClick={onAIMatch}
          aria-label="Open AI Smart Match with current filters"
          data-testid="ai-smart-match-btn"
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
              backgroundSize: "200% auto",
              animation: "shimmer 2.5s linear infinite",
              pointerEvents: "none",
            }}
            aria-hidden
          />
          ✦ AI Smart Match
        </button>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 7, textAlign: "center", lineHeight: 1.5 }}>
          Describe your ideal home in plain language
        </p>
      </motion.div>

      <hr className="divider" style={{ marginBottom: 24 }} />

      {/* Property type */}
      <div className="filter-block">
        <SectionTitle>Property Type</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`filter-chip${filters.type === t.value ? " active" : ""}`}
              onClick={() => set({ type: filters.type === t.value ? "" : t.value })}
              aria-pressed={filters.type === t.value}
            >
              <span aria-hidden>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div className="filter-block">
        <SectionTitle>Bedrooms (BHK)</SectionTitle>
        <div className="bhk-grid">
          {BHK_OPTIONS.map((b) => {
            const val = b === "4+" ? "4" : b;
            return (
              <button
                key={b}
                type="button"
                className={`bhk-btn${filters.bhk === val ? " active" : ""}`}
                onClick={() => set({ bhk: filters.bhk === val ? "" : val })}
                aria-pressed={filters.bhk === val}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div className="filter-block">
        <SectionTitle>Budget</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {BUDGET_PRESETS.map((bp) => {
            const active = filters.maxPrice === (bp.max ?? "") && filters.minPrice === (bp.min ?? "");
            return (
              <button
                key={bp.label}
                type="button"
                className={`bhk-btn${active ? " active" : ""}`}
                onClick={() => set({ minPrice: active ? "" : bp.min ?? "", maxPrice: active ? "" : bp.max ?? "" })}
                aria-pressed={active}
              >
                {bp.label}
              </button>
            );
          })}
        </div>
        {/* Custom range inputs */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            style={{ fontSize: 12, padding: "8px 10px" }}
            min={0}
            aria-label="Minimum price in rupees"
          />
          <input
            className="input"
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            style={{ fontSize: 12, padding: "8px 10px" }}
            min={0}
            aria-label="Maximum price in rupees"
          />
        </div>
      </div>

      {/* Status & quality */}
      <div className="filter-block">
        <SectionTitle>Status &amp; Quality</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "ready" as const, label: "Ready to Move", icon: "✅" },
            { key: "verified" as const, label: "Verified Only", icon: "🛡️" },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${filters[item.key] ? "rgba(0,212,170,0.3)" : "var(--border)"}`,
                background: filters[item.key] ? "var(--teal-dim)" : "var(--glass)",
                transition: "all 0.2s",
                fontSize: 13,
                color: filters[item.key] ? "var(--teal)" : "var(--text-muted)",
                fontWeight: filters[item.key] ? 600 : 400,
              }}
            >
              <span aria-hidden>{item.icon}</span>
              <input
                type="checkbox"
                checked={filters[item.key]}
                onChange={(e) => set({ [item.key]: e.target.checked })}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                aria-label={item.label}
              />
              {item.label}
              {filters[item.key] && (
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--teal)" }}>✓</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Quick search links */}
      <div className="filter-block">
        <SectionTitle>Popular Searches</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            "3BHK Gurgaon under ₹1.5Cr",
            "2BHK Bangalore under ₹80L",
            "Villa Pune under ₹2Cr",
            "1BHK Mumbai under ₹60L",
          ].map((s) => (
            <a
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                padding: "5px 0",
                borderBottom: "1px solid var(--border)",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--teal)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
            >
              <span aria-hidden style={{ color: "var(--teal)", fontSize: 8 }}>▶</span>
              {s}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
