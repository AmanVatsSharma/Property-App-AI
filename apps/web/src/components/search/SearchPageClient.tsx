/**
 * @file SearchPageClient.tsx
 * @module search
 * @description Search page client — filters, grid, map view, pagination; URL state for shareable links
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { DEMO_IMAGES } from "@/lib/demo-images";
import { gqlProperties, type ApiProperty } from "@/lib/graphql-client";
import type { PropertyMapItem } from "./PropertyMap";

const PropertyMap = dynamic(() => import("./PropertyMap").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: 450, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-subtle)", borderRadius: 12 }}>
      Loading map…
    </div>
  ),
});

const BHK_OPTIONS = ["1", "2", "3", "4+"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Sort: Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "ai-score", label: "AI Score" },
];

function parseSearchParams(searchParams: URLSearchParams) {
  return {
    city: searchParams.get("city") ?? "",
    bhk: searchParams.get("bhk") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    sort: searchParams.get("sort") ?? "relevance",
    ready: searchParams.get("ready") === "1",
    verified: searchParams.get("verified") === "1",
  };
}

function buildActiveFilters(params: ReturnType<typeof parseSearchParams>) {
  const list: { key: string; label: string }[] = [];
  if (params.city) list.push({ key: "city", label: params.city });
  if (params.bhk) list.push({ key: "bhk", label: `${params.bhk} BHK` });
  if (params.minPrice || params.maxPrice) list.push({ key: "budget", label: params.maxPrice ? `Under ₹${params.maxPrice}` : params.minPrice ? `From ₹${params.minPrice}` : "Budget" });
  if (params.ready) list.push({ key: "ready", label: "Ready to Move" });
  if (params.verified) list.push({ key: "verified", label: "Verified" });
  return list;
}

function apiToMapItems(list: ApiProperty[]): PropertyMapItem[] {
  return list
    .filter((p): p is ApiProperty & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
    )
    .map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      price: p.price,
      latitude: p.latitude,
      longitude: p.longitude,
    }));
}

function apiToCardItem(p: ApiProperty) {
  const priceStr = p.price >= 1_00_00_000 ? `₹${(p.price / 1_00_00_000).toFixed(2)} Cr` : `₹${(p.price / 1_00_000).toFixed(0)} L`;
  const sqft = p.areaSqft ? ` · ${p.areaSqft.toLocaleString()} sqft` : "";
  return {
    id: p.id,
    price: priceStr,
    name: p.title,
    loc: `${p.location}${sqft}`,
    specs: [
      `${p.bedrooms} BHK`,
      `${p.bathrooms} Bath`,
      ...(p.areaSqft ? [p.areaSqft.toLocaleString()] : []),
      ...(p.specs ?? []),
    ].slice(0, 4),
    tip: p.aiTip ?? "—",
    badges: p.aiScore && p.aiScore >= 90 ? ["badge-teal"] : ["badge-green"],
    badgeLabels: p.aiScore && p.aiScore >= 90 ? ["✦ AI Pick"] : ["✓ Verified"],
    score: p.aiScore ?? 0,
    bg: "linear-gradient(135deg,#132238,#1e3a5f)",
    imageUrl: p.coverImageUrl ?? DEMO_IMAGES.defaultPropertyCover,
  };
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [apiProperties, setApiProperties] = useState<ApiProperty[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const params = parseSearchParams(searchParams);
  const activeFilters = buildActiveFilters(params);

  useEffect(() => {
    setLoadError(null);
    const filter = {
      ...(params.city && { location: params.city }),
      ...(params.bhk && { bedrooms: params.bhk === "4+" ? 4 : parseInt(params.bhk, 10) }),
      limit: 50,
      offset: 0,
    };
    gqlProperties(filter)
      .then((list) => {
        setApiProperties(list);
      })
      .catch((e) => {
        setApiProperties([]);
        setLoadError(e instanceof Error ? e.message : "Failed to load properties");
      });
  }, [params.city, params.bhk]);

  const setParams = useCallback(
    (updates: Partial<ReturnType<typeof parseSearchParams>>) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (k: string, v: string | number | boolean) => {
        if (v === "" || v === false) next.delete(k);
        else next.set(k, String(v));
      };
      if (updates.city !== undefined) apply("city", updates.city);
      if (updates.bhk !== undefined) apply("bhk", updates.bhk);
      if (updates.minPrice !== undefined) apply("minPrice", updates.minPrice);
      if (updates.maxPrice !== undefined) apply("maxPrice", updates.maxPrice);
      if (updates.page !== undefined) apply("page", updates.page);
      if (updates.sort !== undefined) apply("sort", updates.sort);
      if (updates.ready !== undefined) apply("ready", updates.ready ? "1" : "");
      if (updates.verified !== undefined) apply("verified", updates.verified ? "1" : "");
      router.replace(`/search?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "city") setParams({ city: "" });
      else if (key === "bhk") setParams({ bhk: "" });
      else if (key === "budget") setParams({ minPrice: "", maxPrice: "" });
      else if (key === "ready") setParams({ ready: false });
      else if (key === "verified") setParams({ verified: false });
    },
    [setParams]
  );

  const clearAllFilters = useCallback(() => {
    router.replace("/search", { scroll: false });
  }, [router]);

  const [propertyTypeIndex, setPropertyTypeIndex] = useState(0);
  const [bhkIndex, setBhkIndex] = useState(2);
  useEffect(() => {
    const i = BHK_OPTIONS.indexOf(params.bhk);
    if (i >= 0) queueMicrotask(() => setBhkIndex(i));
  }, [params.bhk]);

  return (
    <>
      <div className="search-top-bar">
        <div className="search-query-box">
          <span style={{ color: "var(--teal)", fontSize: 16 }}>✦</span>
          <input
            className="search-q-input"
            placeholder="AI Search: 3BHK near metro under ₹1Cr in Gurgaon..."
            defaultValue={params.city ? `${params.bhk ? params.bhk + " BHK " : ""}in ${params.city}` : undefined}
          />
          <button type="button" style={{ background: "var(--teal)", border: "none", color: "var(--night)", padding: "6px 14px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Search</button>
        </div>
        <span className="results-meta" style={{ marginLeft: 20 }}>
          {apiProperties === null ? "Loading…" : `Showing ${apiProperties.length} propert${apiProperties.length === 1 ? "y" : "ies"}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <select
            className="sort-select"
            value={params.sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="view-toggle">
            <button type="button" className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} title="Grid view" onClick={() => setViewMode("grid")} aria-pressed={viewMode === "grid"}>⊞</button>
            <button type="button" className={`vt-btn ${viewMode === "list" ? "active" : ""}`} title="List view" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}>☰</button>
            <button type="button" className={`vt-btn ${viewMode === "map" ? "active" : ""}`} title="Map view" onClick={() => setViewMode("map")} aria-pressed={viewMode === "map"}>🗺️</button>
          </div>
        </div>
      </div>

      <div className="active-filters">
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>Filters:</span>
        {activeFilters.length === 0 ? (
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>No filters applied</span>
        ) : (
          <>
            {activeFilters.map((f) => (
              <span key={f.key} className="af-tag">
                {f.label}
                <button type="button" className="af-remove" onClick={() => removeFilter(f.key)} aria-label={`Remove ${f.label}`}>×</button>
              </span>
            ))}
            <button type="button" style={{ fontSize: 12, color: "var(--coral)", marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={clearAllFilters}>Clear all</button>
          </>
        )}
      </div>

      <div className="search-layout">
        <aside className="sidebar">
          <div style={{ marginBottom: 20 }}>
            <button type="button" className="ai-match-btn">✦ AI Smart Match</button>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>Let AI find your perfect home automatically</p>
          </div>
          <div className="filter-block">
            <div className="filter-title">Property Type</div>
            <div className="bhk-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
              {["Apartment", "Villa", "Plot", "Builder Floor", "Office", "PG/Co-living"].map((t, i) => (
                <button key={t} type="button" className={`bhk-btn ${propertyTypeIndex === i ? "active" : ""}`} onClick={() => setPropertyTypeIndex(i)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Bedrooms (BHK)</div>
            <div className="bhk-grid">
              {BHK_OPTIONS.map((b, i) => (
                <button
                  key={b}
                  type="button"
                  className={`bhk-btn ${bhkIndex === i ? "active" : ""}`}
                  onClick={() => {
                    setBhkIndex(i);
                    setParams({ bhk: b === "4+" ? "4" : b });
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Budget <span style={{ fontWeight: 400, color: "var(--teal)", fontSize: 13, textTransform: "none", letterSpacing: 0 }}>₹50L – ₹2Cr</span></div>
            <div className="range-wrap">
              <input type="range" className="range" min={20} max={1000} defaultValue={200} />
              <div className="range-labels"><span>₹20L</span><span className="range-val">₹200L</span><span>₹10Cr</span></div>
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Area (sq.ft)</div>
            <div className="range-wrap">
              <input type="range" className="range" min={500} max={5000} defaultValue={1500} />
              <div className="range-labels"><span>500</span><span className="range-val">1,500 sqft</span><span>5,000+</span></div>
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Status</div>
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input type="checkbox" checked={params.ready} onChange={(e) => setParams({ ready: e.target.checked })} />
                Ready to Move
              </label>
              <label className="checkbox-item"><input type="checkbox" /> Under Construction</label>
              <label className="checkbox-item"><input type="checkbox" /> New Launch</label>
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Quality</div>
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input type="checkbox" checked={params.verified} onChange={(e) => setParams({ verified: e.target.checked })} />
                Verified only
              </label>
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">AI Score <span style={{ fontWeight: 400, fontSize: 11, color: "var(--teal)", textTransform: "none", letterSpacing: 0 }}>Min: 75</span></div>
            <div className="range-wrap">
              <input type="range" className="range" min={0} max={100} defaultValue={75} />
              <div className="range-labels"><span>0</span><span className="range-val">75</span><span>100</span></div>
            </div>
          </div>
        </aside>

        <div className="search-main">
          <div className="listings-wrap">
            {apiProperties === null ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                Loading properties…
              </div>
            ) : viewMode === "map" ? (
              <PropertyMap
                properties={apiToMapItems(apiProperties)}
                className="search-map-container"
              />
            ) : (
              <>
            {loadError && (
              <div style={{ padding: 12, marginBottom: 16, background: "var(--coral)", color: "var(--night)", borderRadius: 8 }}>
                {loadError}
              </div>
            )}
            {apiProperties.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                No properties found. Try adjusting your filters or ensure the backend is connected.
              </div>
            ) : (
            <div className="prop-grid">
              {apiProperties.map((p) => {
                const card = apiToCardItem(p);
                return (
                <Link key={p.id} href={`/property/${p.id}`} className="prop-card reveal">
                  <div className="prop-img">
                    <PropertyImage
                      src={card.imageUrl}
                      alt={card.name}
                      className="prop-img-bg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      placeholderGradient={card.bg}
                    />
                    <div className="prop-img-grad" />
                    <div className="prop-badges">
                      {card.badgeLabels.map((l, j) => (
                        <span key={j} className={`badge ${card.badges[j]}`}>{l}</span>
                      ))}
                    </div>
                    <button type="button" className="prop-heart" onClick={(e) => e.stopPropagation()} aria-label="Save">♡</button>
                    <div className="prop-ai-score"><div className="score-n">{card.score}</div><div className="score-l">AI Score</div></div>
                  </div>
                  <div className="prop-body">
                    <div className="prop-price">{card.price} <span>onwards</span></div>
                    <div className="prop-name">{card.name}</div>
                    <div className="prop-loc">📍 {card.loc}</div>
                    <div className="prop-specs">{card.specs.map((s, j) => <span key={j} className="prop-spec">{s}</span>)}</div>
                    <div className="prop-ai-tip"><strong>✦ AI:</strong> {card.tip}</div>
                  </div>
                </Link>
                );
              })}
            </div>
            )}
                <div className="pagination">
                  <button type="button" className="page-btn" onClick={() => setParams({ page: params.page - 1 })} disabled={params.page <= 1}>‹</button>
                  {[1, 2, 3].map((n) => (
                    <button key={n} type="button" className={`page-btn ${params.page === n ? "active" : ""}`} onClick={() => setParams({ page: n })}>{n}</button>
                  ))}
                  <span style={{ color: "var(--text-dim)", padding: "0 4px", display: "flex", alignItems: "center" }}>…</span>
                  <button type="button" className="page-btn" onClick={() => setParams({ page: 24 })}>24</button>
                  <button type="button" className="page-btn" onClick={() => setParams({ page: params.page + 1 })}>›</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
