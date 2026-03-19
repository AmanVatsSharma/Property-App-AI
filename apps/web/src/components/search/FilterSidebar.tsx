/**
 * @file FilterSidebar.tsx
 * @module search
 * @description Sidebar filters: property type, BHK, budget presets, status/quality; AI Smart Match CTA.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useCallback } from "react";

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

const TYPES = [
  { label: "Apartment", value: "apartment" },
  { label: "Villa", value: "villa" },
  { label: "Plot", value: "plot" },
  { label: "Builder", value: "builder-floor" },
  { label: "Office", value: "office" },
  { label: "PG/Co", value: "pg" },
];

const BHK = ["1", "2", "3", "4+"];

const BUDGET_PRESETS = [
  { label: "Under 50L", max: "5000000" },
  { label: "Under 1 Cr", max: "10000000" },
  { label: "Under 2 Cr", max: "20000000" },
  { label: "2 Cr+", min: "20000000", max: "" },
];

export function FilterSidebar({ filters, onChange, onAIMatch }: Props) {
  const set = useCallback((patch: Partial<Filters>) => onChange(patch), [onChange]);

  return (
    <aside className="sidebar" aria-label="Property filters">
      {/* AI Match */}
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          className="ai-match-btn"
          style={{ width: "100%", padding: "13px 0" }}
          onClick={onAIMatch}
          aria-label="Open AI Smart Match with current filters"
          data-testid="ai-smart-match-btn"
        >
          ✦ AI Smart Match
        </button>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            marginTop: 7,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Describe your ideal home in plain language
        </p>
      </div>

      <hr className="divider" style={{ marginBottom: 24 }} />

      {/* Property type */}
      <div className="filter-block">
        <div className="filter-title">Property Type</div>
        <div className="bhk-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`bhk-btn${filters.type === t.value ? " active" : ""}`}
              onClick={() =>
                set({ type: filters.type === t.value ? "" : t.value })
              }
              aria-pressed={filters.type === t.value}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div className="filter-block">
        <div className="filter-title">Bedrooms (BHK)</div>
        <div className="bhk-grid">
          {BHK.map((b) => {
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
        <div className="filter-title" style={{ marginBottom: 12 }}>
          Budget
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {BUDGET_PRESETS.map((bp) => {
            const active =
              filters.maxPrice === (bp.max ?? "") &&
              filters.minPrice === (bp.min ?? "");
            return (
              <button
                key={bp.label}
                type="button"
                className={`bhk-btn${active ? " active" : ""}`}
                onClick={() =>
                  set({
                    minPrice: active ? "" : bp.min ?? "",
                    maxPrice: active ? "" : bp.max ?? "",
                  })
                }
                aria-pressed={active}
              >
                {bp.label}
              </button>
            );
          })}
        </div>
        {/* Custom range */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            className="input"
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })}
            style={{ fontSize: 12, padding: "8px 10px" }}
            min={0}
          />
          <input
            className="input"
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })}
            style={{ fontSize: 12, padding: "8px 10px" }}
            min={0}
          />
        </div>
      </div>

      {/* Status */}
      <div className="filter-block">
        <div className="filter-title">Status & Quality</div>
        <div className="checkbox-list">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={filters.ready}
              onChange={(e) => set({ ready: e.target.checked })}
            />
            Ready to Move
          </label>
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => set({ verified: e.target.checked })}
            />
            Verified only
          </label>
        </div>
      </div>
    </aside>
  );
}
