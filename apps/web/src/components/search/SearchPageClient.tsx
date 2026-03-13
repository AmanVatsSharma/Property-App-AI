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
import { DEMO_IMAGES } from "@/lib/demo-images";
import { PropertyImage } from "@/components/ui/PropertyImage";
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

const PROPERTIES: Array<{
  id: string;
  price: string;
  name: string;
  loc: string;
  specs: string[];
  tip: string;
  badges: string[];
  badgeLabels: string[];
  score: number;
  bg: string;
  imageUrl: string;
}> = [
  { id: "sobha-city-vista", price: "₹2.85 Cr", name: "Sobha City Vista — 4 BHK Ultra Luxury", loc: "Sector 108, Gurgaon · 2,850 sqft", specs: ["4 BHK", "4 Bath", "2 Park", "RERA"], tip: "18% appreciation expected. Metro 1.2km. Priced 8% below market.", badges: ["badge-gold", "badge-teal"], badgeLabels: ["⭐ Premium", "✦ AI Pick"], score: 94, bg: "linear-gradient(135deg,#132238,#1e3a5f)", imageUrl: DEMO_IMAGES.properties["sobha-city-vista"].cover },
  { id: "dlf-mypad", price: "₹78 L", name: "DLF MyPad — 2 BHK Studio, Noida", loc: "Sector 59, Noida · 1,100 sqft", specs: ["2 BHK", "2 Bath", "1,100"], tip: "Best value in locality. 92% of seekers shortlisted this.", badges: ["badge-green", "badge-coral"], badgeLabels: ["✓ Verified", "🔥 Hot"], score: 88, bg: "linear-gradient(135deg,#1a2e1a,#2a4a2a)", imageUrl: DEMO_IMAGES.properties["dlf-mypad"].cover },
  { id: "m3m-golf-hills", price: "₹1.45 Cr", name: "M3M Golf Hills — 3 BHK Premium", loc: "Sector 79, Gurgaon · 1,890 sqft", specs: ["3 BHK", "3 Bath", "1 Park"], tip: "37 views today. Price rising after DDJK highway opens Q2.", badges: ["badge-white", "badge-teal"], badgeLabels: ["NEW", "✦ AI Pick"], score: 91, bg: "linear-gradient(135deg,#1a1a30,#2a2a50)", imageUrl: DEMO_IMAGES.properties["m3m-golf-hills"].cover },
  { id: "prestige-sunrise-park", price: "₹62 L", name: "Prestige Sunrise Park — 2 BHK", loc: "Whitefield, Bangalore · 1,250 sqft", specs: ["2 BHK", "2 Bath", "RERA"], tip: "IT corridor adjacency. 28% YoY appreciation recorded.", badges: ["badge-gold"], badgeLabels: ["⭐ Featured"], score: 86, bg: "linear-gradient(135deg,#2a1a1a,#4a2a2a)", imageUrl: DEMO_IMAGES.properties["prestige-sunrise-park"].cover },
  { id: "brigade-cornerstone-utopia", price: "₹95 L", name: "Brigade Cornerstone Utopia — 3 BHK", loc: "Yelahanka, Bangalore · 1,580 sqft", specs: ["3 BHK", "3 Bath", "Dec 2026"], tip: "Launch price — 22% gains likely at possession.", badges: ["badge-coral"], badgeLabels: ["Under Construction"], score: 79, bg: "linear-gradient(135deg,#1a2a1a,#253a25)", imageUrl: DEMO_IMAGES.properties["brigade-cornerstone-utopia"].cover },
  { id: "godrej-meridian", price: "₹1.8 Cr", name: "Godrej Meridian — 4 BHK, Gurgaon", loc: "Sector 106, Gurgaon · 2,200 sqft", specs: ["4 BHK", "4 Bath", "2 Park"], tip: "Golf course views. Excellent school access score of 88.", badges: ["badge-green"], badgeLabels: ["✓ Verified"], score: 83, bg: "linear-gradient(135deg,#0d1a2a,#162a3a)", imageUrl: DEMO_IMAGES.properties["godrej-meridian"].cover },
];

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
    imageUrl: p.coverImageUrl ?? "",
  };
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [apiProperties, setApiProperties] = useState<ApiProperty[] | null>(null);

  const params = parseSearchParams(searchParams);
  const activeFilters = buildActiveFilters(params);

  useEffect(() => {
    const filter = {
      ...(params.city && { location: params.city }),
      ...(params.bhk && { bedrooms: params.bhk === "4+" ? 4 : parseInt(params.bhk, 10) }),
      limit: 50,
      offset: 0,
    };
    gqlProperties(filter).then(setApiProperties).catch(() => setApiProperties([]));
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
        <span className="results-meta" style={{ marginLeft: 20 }}>Showing <strong>2,847</strong> properties</span>
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
            {viewMode === "map" ? (
              <PropertyMap
                properties={apiToMapItems(apiProperties ?? [])}
                className="search-map-container"
              />
            ) : (
              <>
            <div className="prop-grid">
              {(apiProperties != null ? apiProperties.map(apiToCardItem) : PROPERTIES).map((p) => (
                <Link key={p.id} href={`/property/${p.id}`} className="prop-card reveal">
                  <div className="prop-img">
                    <PropertyImage
                      src={p.imageUrl}
                      alt={p.name}
                      className="prop-img-bg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      placeholderGradient={p.bg}
                    />
                    <div className="prop-img-grad" />
                    <div className="prop-badges">
                      {p.badgeLabels.map((l, j) => (
                        <span key={j} className={`badge ${p.badges[j]}`}>{l}</span>
                      ))}
                    </div>
                    <button type="button" className="prop-heart" onClick={(e) => e.stopPropagation()} aria-label="Save">♡</button>
                    <div className="prop-ai-score"><div className="score-n">{p.score}</div><div className="score-l">AI Score</div></div>
                  </div>
                  <div className="prop-body">
                    <div className="prop-price">{p.price} <span>onwards</span></div>
                    <div className="prop-name">{p.name}</div>
                    <div className="prop-loc">📍 {p.loc}</div>
                    <div className="prop-specs">{p.specs.map((s, j) => <span key={j} className="prop-spec">{s}</span>)}</div>
                    <div className="prop-ai-tip"><strong>✦ AI:</strong> {p.tip}</div>
                  </div>
                </Link>
              ))}
            </div>
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
