/**
 * @file SearchPageClient.tsx
 * @module search
 * @description Search page client — filters, grid, map view, pagination; URL state for shareable links.
 * Uses only API data (properties query); DEMO_IMAGES only as fallback for missing cover images.
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyCard } from "./PropertyCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { gqlProperties, gqlSearchPropertiesByQuery, gqlToggleFavorite, type ApiProperty } from "@/lib/graphql-client";
import { useAIFab } from "@/components/providers/AIFabProvider";
import { useAuth } from "@/components/providers/AuthProvider";
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

const PROPERTY_TYPE_FILTERS = ["apartment", "villa", "plot", "builder-floor", "office", "pg"];

function parseSearchParams(searchParams: URLSearchParams) {
  return {
    city: searchParams.get("city") ?? "",
    bhk: searchParams.get("bhk") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    sort: searchParams.get("sort") ?? "relevance",
    type: searchParams.get("type") ?? "",
    ready: searchParams.get("ready") === "1",
    verified: searchParams.get("verified") === "1",
  };
}

function buildActiveFilters(params: ReturnType<typeof parseSearchParams>) {
  const list: { key: string; label: string }[] = [];
  if (params.city) list.push({ key: "city", label: params.city });
  if (params.type) list.push({ key: "type", label: params.type });
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

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openPanelWithPrompt } = useAIFab();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [apiProperties, setApiProperties] = useState<ApiProperty[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [nlSearchResults, setNlSearchResults] = useState<ApiProperty[] | null>(null);
  const [nlSearchLoading, setNlSearchLoading] = useState(false);

  const params = parseSearchParams(searchParams);
  const activeFilters = buildActiveFilters(params);

  useEffect(() => {
    if (params.city && !aiQuery) {
      setAiQuery(params.bhk ? `${params.bhk} BHK in ${params.city}` : `in ${params.city}`);
    }
  }, [params.city, params.bhk]);

  useEffect(() => {
    const sortMap: Record<string, { sortBy?: "createdAt" | "price" | "aiScore"; sortOrder?: "asc" | "desc" }> = {
      relevance: { sortBy: "createdAt", sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      "price-asc": { sortBy: "price", sortOrder: "asc" },
      "price-desc": { sortBy: "price", sortOrder: "desc" },
      "ai-score": { sortBy: "aiScore", sortOrder: "desc" },
    };
    const sortConfig = sortMap[params.sort] ?? sortMap.relevance;
    const filter = {
      ...(params.city && { location: params.city }),
      ...(params.type && { type: params.type }),
      ...(params.bhk && { bedrooms: parseInt(params.bhk, 10) }),
      ...(params.minPrice && { minPrice: parseInt(params.minPrice, 10) }),
      ...(params.maxPrice && { maxPrice: parseInt(params.maxPrice, 10) }),
      limit: 20,
      offset: (params.page - 1) * 20,
      ...sortConfig,
    };

    gqlProperties(filter)
      .then((list) => {
        setLoadError(null);
        setApiProperties(list);
      })
      .catch((e) => {
        setApiProperties([]);
        setLoadError(e instanceof Error ? e.message : "Failed to load properties");
      });
  }, [params.city, params.type, params.bhk, params.minPrice, params.maxPrice, params.page, params.sort]);

  const setParams = useCallback(
    (updates: Partial<ReturnType<typeof parseSearchParams>>) => {
      setNlSearchResults(null);
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
      if (updates.type !== undefined) apply("type", updates.type);
      if (updates.ready !== undefined) apply("ready", updates.ready ? "1" : "");
      if (updates.verified !== undefined) apply("verified", updates.verified ? "1" : "");
      router.replace(`/search?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "city") setParams({ city: "" });
      else if (key === "type") setParams({ type: "" });
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

  const buildAIPromptFromFilters = useCallback(() => {
    const parts: string[] = [];
    if (params.bhk) parts.push(`${params.bhk} BHK`);
    if (params.city) parts.push(`in ${params.city}`);
    if (params.type) parts.push(params.type);
    if (params.maxPrice) parts.push(`under ₹${params.maxPrice}`);
    if (params.minPrice) parts.push(`from ₹${params.minPrice}`);
    return parts.length > 0 ? parts.join(" ") : "Find my perfect home based on current filters";
  }, [params.bhk, params.city, params.type, params.minPrice, params.maxPrice]);

  const runNlSearch = useCallback(async () => {
    const q = aiQuery.trim() || "Find properties matching my criteria";
    setNlSearchLoading(true);
    setLoadError(null);
    try {
      const list = await gqlSearchPropertiesByQuery(q);
      setNlSearchResults(list);
    } catch (e) {
      setNlSearchResults([]);
      setLoadError(e instanceof Error ? e.message : "AI search failed. Try opening the AI assistant instead.");
    } finally {
      setNlSearchLoading(false);
    }
  }, [aiQuery]);

  const [propertyTypeIndex, setPropertyTypeIndex] = useState(0);
  const [bhkIndex, setBhkIndex] = useState(2);
  useEffect(() => {
    const i = BHK_OPTIONS.indexOf(params.bhk);
    if (i >= 0) queueMicrotask(() => setBhkIndex(i));
  }, [params.bhk]);

  const handleHeartClick = useCallback(
    async (id: string, saved: boolean) => {
      if (!token) {
        showToast("Sign in to save properties", "info");
        return;
      }
      try {
        await gqlToggleFavorite(id, { Authorization: `Bearer ${token}` });
        showToast(
          saved ? "Saved to favourites" : "Removed from favourites",
          "success",
        );
      } catch {
        showToast("Could not update saved status", "error");
      }
    },
    [token, showToast],
  );

  return (
    <>
      <div className="search-top-bar">
        <div className="search-query-box">
          <span className="search-query-ai-icon" aria-hidden>✦</span>
          <input
            className="search-q-input"
            placeholder="AI Search... Describe what you want in plain language — e.g. 3BHK near metro under ₹1Cr in Gurgaon"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runNlSearch();
            }}
            aria-label="AI search — describe what you want (e.g. 3 BHK near school near metro); Enter runs search"
            data-testid="ai-search-input"
          />
          <button
            type="button"
            className="search-query-ai-btn"
            onClick={() => runNlSearch()}
            disabled={nlSearchLoading}
            aria-label="Run AI search"
            data-testid="ai-search-submit"
          >
            {nlSearchLoading ? "…" : "✦ AI Search"}
          </button>
        </div>
        <span className="results-meta" style={{ marginLeft: 20 }}>
          {nlSearchLoading
            ? "Searching…"
            : nlSearchResults !== null
              ? `AI search: ${nlSearchResults.length} propert${nlSearchResults.length === 1 ? "y" : "ies"}`
              : apiProperties === null
                ? "Loading…"
                : `Showing ${apiProperties.length} propert${apiProperties.length === 1 ? "y" : "ies"}`}
        </span>
        {nlSearchResults !== null && (
          <button
            type="button"
            onClick={() => { openPanelWithPrompt(aiQuery.trim() || "Refine my search"); }}
            className="ai-match-btn"
            style={{ marginLeft: 12, padding: "6px 12px", fontSize: 12 }}
            data-testid="refine-with-ai-btn"
          >
            Refine with AI
          </button>
        )}
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
          <div className="view-toggle" role="group" aria-label="View mode">
            <button type="button" className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} title="Grid view" onClick={() => setViewMode("grid")} aria-pressed={viewMode === "grid"} aria-label="Grid view">⊞</button>
            <button type="button" className={`vt-btn ${viewMode === "list" ? "active" : ""}`} title="List view" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"} aria-label="List view">☰</button>
            <button type="button" className={`vt-btn ${viewMode === "map" ? "active" : ""}`} title="Map view" onClick={() => setViewMode("map")} aria-pressed={viewMode === "map"} aria-label="Map view">🗺️</button>
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
            <button
              type="button"
              className="ai-match-btn"
              onClick={() => openPanelWithPrompt(buildAIPromptFromFilters())}
              aria-label="Open AI Smart Match with current filters"
              data-testid="ai-smart-match-btn"
            >
              ✦ AI Smart Match
            </button>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>Let AI find your perfect home automatically</p>
          </div>
          <div className="filter-block">
            <div className="filter-title">Property Type</div>
            <div className="bhk-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
              {["Apartment", "Villa", "Plot", "Builder Floor", "Office", "PG/Co-living"].map((t, i) => (
                <button key={t} type="button" className={`bhk-btn ${propertyTypeIndex === i ? "active" : ""}`} onClick={() => {
                    setPropertyTypeIndex(i);
                    setParams({ type: PROPERTY_TYPE_FILTERS[i] ?? "" });
                  }}>{t}</button>
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
            {apiProperties === null && nlSearchResults === null && !nlSearchLoading ? (
              <SkeletonGrid count={6} />
            ) : viewMode === "map" ? (
              <PropertyMap
                properties={apiToMapItems(nlSearchResults ?? apiProperties ?? [])}
                className="search-map-container"
              />
            ) : (
              <>
                {nlSearchLoading && <SkeletonGrid count={6} />}
                {!nlSearchLoading && loadError && (
                  <div
                    style={{
                      padding: 12,
                      marginBottom: 16,
                      background: "var(--coral-dim)",
                      border: "1px solid rgba(255,107,74,0.2)",
                      borderRadius: 8,
                      color: "var(--coral)",
                      fontSize: 13,
                    }}
                  >
                    {loadError}
                  </div>
                )}
                {!nlSearchLoading &&
                  (nlSearchResults ?? apiProperties ?? []).length === 0 &&
                  !loadError && (
                    <div
                      style={{
                        padding: 48,
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No properties found. Try adjusting your filters or
                      connecting the backend.
                    </div>
                  )}
                {!nlSearchLoading &&
                  (nlSearchResults ?? apiProperties ?? []).length > 0 && (
                    <div className="prop-grid">
                      {(nlSearchResults ?? apiProperties ?? []).map((p) => (
                        <PropertyCard
                          key={p.id}
                          property={p}
                          onHeartClick={handleHeartClick}
                        />
                      ))}
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
