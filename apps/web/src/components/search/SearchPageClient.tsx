/**
 * @file SearchPageClient.tsx
 * @module search
 * @description Search page client — filters, grid/list/map views, sort pills,
 *              staggered Framer Motion reveals, animated result count, URL state.
 *              Full light + dark mode via CSS variable tokens.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  gqlProperties,
  gqlSearchPropertiesByQuery,
  gqlToggleFavorite,
  type ApiProperty,
} from "@/lib/graphql-client";
import { useAIFab } from "@/components/providers/AIFabProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PropertyCard } from "./PropertyCard";
import { FilterSidebar } from "./FilterSidebar";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { SaveSearchButton } from "./SaveSearchButton";
import type { PropertyMapItem } from "./PropertyMap";

const PropertyMap = dynamic(() => import("./PropertyMap").then((m) => m.PropertyMap), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: 450, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dark-2)", borderRadius: 12, color: "var(--text-muted)", fontSize: 13 }}>
      Loading map…
    </div>
  ),
});

/* ── constants ────────────────────────────────────────────────────── */

const SORT_PILLS = [
  { value: "relevance", label: "Relevance" },
  { value: "ai-score", label: "✦ AI Score" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
];

/* ── helpers ──────────────────────────────────────────────────────── */

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
    location: searchParams.get("location") ?? "",
  };
}

function buildActiveFilters(params: ReturnType<typeof parseSearchParams>) {
  const list: { key: string; label: string }[] = [];
  if (params.city || params.location) list.push({ key: "city", label: params.city || params.location });
  if (params.type) list.push({ key: "type", label: params.type });
  if (params.bhk) list.push({ key: "bhk", label: `${params.bhk} BHK` });
  if (params.minPrice || params.maxPrice) list.push({ key: "budget", label: params.maxPrice ? `Under ₹${parseInt(params.maxPrice, 10).toLocaleString("en-IN")}` : `From ₹${parseInt(params.minPrice, 10).toLocaleString("en-IN")}` });
  if (params.ready) list.push({ key: "ready", label: "Ready to Move" });
  if (params.verified) list.push({ key: "verified", label: "Verified" });
  return list;
}

function apiToMapItems(list: ApiProperty[]): PropertyMapItem[] {
  return list
    .filter((p): p is ApiProperty & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null && Number.isFinite(p.latitude) && Number.isFinite(p.longitude),
    )
    .map((p) => ({ id: p.id, title: p.title, location: p.location, price: p.price, latitude: p.latitude, longitude: p.longitude }));
}

/* ── animation variants ───────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
  }),
};

/* ── component ────────────────────────────────────────────────────── */

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
  const [searchFocused, setSearchFocused] = useState(false);

  const params = parseSearchParams(searchParams);
  const activeFilters = buildActiveFilters(params);
  const displayedProperties = nlSearchResults ?? apiProperties ?? [];

  /* Pre-fill query from URL params */
  useEffect(() => {
    const city = params.city || params.location;
    if (city && !aiQuery) {
      setAiQuery(params.bhk ? `${params.bhk} BHK in ${city}` : `in ${city}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.city, params.bhk, params.location]);

  /* Load properties from API */
  useEffect(() => {
    const sortMap: Record<string, { sortBy?: "createdAt" | "price" | "aiScore"; sortOrder?: "asc" | "desc" }> = {
      relevance: { sortBy: "createdAt", sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      "price-asc": { sortBy: "price", sortOrder: "asc" },
      "price-desc": { sortBy: "price", sortOrder: "desc" },
      "ai-score": { sortBy: "aiScore", sortOrder: "desc" },
    };
    const sortConfig = sortMap[params.sort] ?? sortMap.relevance;
    const locationFilter = params.city || params.location;
    const filter = {
      ...(locationFilter && { location: locationFilter }),
      ...(params.type && { type: params.type }),
      ...(params.bhk && { bedrooms: parseInt(params.bhk, 10) }),
      ...(params.minPrice && { minPrice: parseInt(params.minPrice, 10) }),
      ...(params.maxPrice && { maxPrice: parseInt(params.maxPrice, 10) }),
      limit: 20,
      offset: (params.page - 1) * 20,
      ...sortConfig,
    };

    setApiProperties(null);
    gqlProperties(filter)
      .then((list) => { setLoadError(null); setApiProperties(list); })
      .catch((e) => { setApiProperties([]); setLoadError(e instanceof Error ? e.message : "Failed to load properties"); });
  }, [params.city, params.location, params.type, params.bhk, params.minPrice, params.maxPrice, params.page, params.sort]);

  const setParams = useCallback(
    (updates: Partial<ReturnType<typeof parseSearchParams>>) => {
      setNlSearchResults(null);
      const next = new URLSearchParams(searchParams.toString());
      const apply = (k: string, v: string | number | boolean) => {
        if (v === "" || v === false) next.delete(k);
        else next.set(k, String(v));
      };
      Object.entries(updates).forEach(([k, v]) => apply(k, v as string | number | boolean));
      router.replace(`/search?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "city") setParams({ city: "", location: "" });
      else if (key === "type") setParams({ type: "" });
      else if (key === "bhk") setParams({ bhk: "" });
      else if (key === "budget") setParams({ minPrice: "", maxPrice: "" });
      else if (key === "ready") setParams({ ready: false });
      else if (key === "verified") setParams({ verified: false });
    },
    [setParams],
  );

  const buildAIPrompt = useCallback(() => {
    const parts: string[] = [];
    if (params.bhk) parts.push(`${params.bhk} BHK`);
    const city = params.city || params.location;
    if (city) parts.push(`in ${city}`);
    if (params.type) parts.push(params.type);
    if (params.maxPrice) parts.push(`under ₹${params.maxPrice}`);
    return parts.length > 0 ? parts.join(" ") : "Find my perfect home based on current filters";
  }, [params]);

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

  const handleHeartClick = useCallback(
    async (id: string, saved: boolean) => {
      if (!token) { showToast("Sign in to save properties", "info"); return; }
      try {
        await gqlToggleFavorite(id, { Authorization: `Bearer ${token}` });
        showToast(saved ? "Saved to favourites" : "Removed from favourites", "success");
      } catch {
        showToast("Could not update saved status", "error");
      }
    },
    [token, showToast],
  );

  const resultCount = nlSearchResults !== null ? nlSearchResults.length : (apiProperties?.length ?? null);

  return (
    <>
      {/* ── Search top bar ─────────────────────────────────────── */}
      <div className="search-top-bar">
        <div
          className="search-query-box"
          style={{
            boxShadow: searchFocused ? "0 0 0 2px var(--teal), 0 4px 16px rgba(0,212,170,0.15)" : "none",
            transition: "box-shadow 0.25s",
          }}
        >
          <motion.span
            className="search-query-ai-icon"
            aria-hidden
            animate={{ rotate: nlSearchLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: nlSearchLoading ? Infinity : 0, ease: "linear" }}
          >
            ✦
          </motion.span>
          <input
            className="search-q-input"
            placeholder="AI Search… describe what you want — e.g. 3BHK near metro under ₹1Cr in Gurgaon"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter") runNlSearch(); }}
            aria-label="AI search — describe what you want"
            data-testid="ai-search-input"
          />
          <button
            type="button"
            className="search-query-ai-btn"
            onClick={runNlSearch}
            disabled={nlSearchLoading}
            aria-label="Run AI search"
            data-testid="ai-search-submit"
          >
            {nlSearchLoading ? "…" : "✦ Search"}
          </button>
        </div>

        {/* Results count with animation */}
        <AnimatePresence mode="wait">
          <motion.span
            key={resultCount ?? "loading"}
            className="results-meta"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            style={{ marginLeft: 20, whiteSpace: "nowrap" }}
          >
            {nlSearchLoading
              ? "Searching…"
              : nlSearchResults !== null
                ? `AI: ${nlSearchResults.length} result${nlSearchResults.length !== 1 ? "s" : ""}`
                : apiProperties === null
                  ? "Loading…"
                  : `${apiProperties.length} propert${apiProperties.length !== 1 ? "ies" : "y"}`}
          </motion.span>
        </AnimatePresence>

        <SaveSearchButton
          filters={{
            ...(params.city && { location: params.city }),
            ...(params.bhk && { bedrooms: parseInt(params.bhk, 10) }),
            ...(params.type && { type: params.type }),
            ...(params.minPrice && { minPrice: parseInt(params.minPrice, 10) }),
            ...(params.maxPrice && { maxPrice: parseInt(params.maxPrice, 10) }),
          }}
        />

        {nlSearchResults !== null && (
          <button
            type="button"
            onClick={() => openPanelWithPrompt(aiQuery.trim() || "Refine my search")}
            className="ai-match-btn"
            style={{ marginLeft: 12, padding: "6px 12px", fontSize: 12 }}
            data-testid="refine-with-ai-btn"
          >
            Refine with AI
          </button>
        )}

        {/* View mode toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div className="view-toggle" role="group" aria-label="View mode">
            {(["grid", "list", "map"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`vt-btn ${viewMode === mode ? "active" : ""}`}
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                aria-label={`${mode} view`}
              >
                {mode === "grid" ? "⊞" : mode === "list" ? "☰" : "🗺️"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sort pills ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--dark)",
          overflowX: "auto",
          scrollbarWidth: "none",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          Sort:
        </span>
        {SORT_PILLS.map((pill) => (
          <button
            key={pill.value}
            type="button"
            className={`sort-pill ${params.sort === pill.value ? "active" : ""}`}
            onClick={() => setParams({ sort: pill.value })}
            aria-pressed={params.sort === pill.value}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* ── Active filter chips ────────────────────────────────── */}
      {activeFilters.length > 0 && (
        <motion.div
          className="active-filters"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>Filters:</span>
          {activeFilters.map((f) => (
            <span key={f.key} className="af-tag">
              {f.label}
              <button type="button" className="af-remove" onClick={() => removeFilter(f.key)} aria-label={`Remove ${f.label} filter`}>×</button>
            </span>
          ))}
          <button
            type="button"
            style={{ fontSize: 12, color: "var(--coral)", marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            onClick={() => router.replace("/search", { scroll: false })}
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* ── Main search layout ─────────────────────────────────── */}
      <div className="search-layout">
        <FilterSidebar
          filters={{ type: params.type, bhk: params.bhk, minPrice: params.minPrice, maxPrice: params.maxPrice, ready: params.ready, verified: params.verified }}
          onChange={(patch) => setParams(patch as Parameters<typeof setParams>[0])}
          onAIMatch={() => openPanelWithPrompt(buildAIPrompt())}
        />

        <div className="search-main">
          <div className="listings-wrap">
            {/* Loading */}
            {(apiProperties === null && nlSearchResults === null && !nlSearchLoading) || nlSearchLoading ? (
              <SkeletonGrid count={6} />
            ) : viewMode === "map" ? (
              <PropertyMap
                properties={apiToMapItems(displayedProperties)}
                className="search-map-container"
              />
            ) : (
              <>
                {/* Error banner */}
                {loadError && !nlSearchLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: 12, marginBottom: 16, background: "var(--coral-dim)", border: "1px solid rgba(255,107,74,0.2)", borderRadius: 8, color: "var(--coral)", fontSize: 13 }}
                  >
                    {loadError}
                  </motion.div>
                )}

                {/* Empty state */}
                {!nlSearchLoading && displayedProperties.length === 0 && !loadError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ padding: "64px 24px", textAlign: "center", background: "var(--dark-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}
                  >
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
                    <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, color: "var(--heading)", marginBottom: 10 }}>
                      No properties found
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
                      Try adjusting your filters or use AI search to describe what you want.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      {["2 BHK Gurgaon", "Villa Bangalore", "1 BHK Mumbai under 50L"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="filter-chip"
                          onClick={() => { setAiQuery(s); runNlSearch(); }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: "9px 20px" }}
                        onClick={() => router.replace("/search", { scroll: false })}
                      >
                        Clear filters
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: "9px 20px" }}
                        onClick={() => openPanelWithPrompt("Find me the perfect property")}
                      >
                        ✦ Try AI Search
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Property grid — staggered reveal */}
                {!nlSearchLoading && displayedProperties.length > 0 && (
                  <motion.div
                    key={`results-${params.sort}-${params.page}-${displayedProperties.length}`}
                    className="prop-grid"
                    style={{ gridTemplateColumns: viewMode === "list" ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))" }}
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  >
                    {displayedProperties.map((p, i) => (
                      <motion.div key={p.id} variants={cardVariants} custom={i}>
                        <PropertyCard
                          property={p}
                          onHeartClick={handleHeartClick}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Pagination */}
                {displayedProperties.length > 0 && nlSearchResults === null && (
                  <div className="pagination">
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => setParams({ page: params.page - 1 })}
                      disabled={params.page <= 1}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`page-btn ${params.page === n ? "active" : ""}`}
                        onClick={() => setParams({ page: n })}
                        aria-label={`Page ${n}`}
                        aria-current={params.page === n ? "page" : undefined}
                      >
                        {n}
                      </button>
                    ))}
                    <span style={{ color: "var(--text-dim)", padding: "0 4px", display: "flex", alignItems: "center" }}>…</span>
                    <button
                      type="button"
                      className="page-btn"
                      onClick={() => setParams({ page: params.page + 1 })}
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
