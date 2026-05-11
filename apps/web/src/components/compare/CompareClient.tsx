/**
 * File:        apps/web/src/components/compare/CompareClient.tsx
 * Module:      Web · Compare Properties (client component)
 * Purpose:     Interactive premium comparison UI for 2–5 properties. Computes
 *              per-row "winners" (lowest price, highest AI score, biggest
 *              area, etc.), surfaces verified-listing and price-drop signals,
 *              lets the user request an AI verdict via the agent's
 *              `compare_properties` tool and remove a column on the fly.
 *
 * Exports:
 *   - CompareClient(props: CompareClientProps): JSX.Element
 *     — props: { initialProperties: ApiProperty[]; initialIds: string[]; maxCompare: number }
 *     — renders the full compare experience: hero, columns, verdict panel.
 *
 * Depends on:
 *   - @/lib/graphql-client      — gqlAskAgent, gqlSearchPropertiesByQuery, ApiProperty type
 *   - @/components/ui           — Button, Badge, PropertyImage primitives
 *   - next/link, next/navigation — URL sync (router.replace) for shareable URLs
 *
 * Side-effects:
 *   - On "Add property" search: GraphQL search request via gqlSearchPropertiesByQuery.
 *   - On "Get AI Verdict": GraphQL askAgent mutation (may take 5–30s).
 *   - Updates the URL ?ids=... so the comparison is shareable / bookmarkable.
 *
 * Key invariants:
 *   - Comparison set is bounded to maxCompare (default 5; matches the agent
 *     compare_properties tool input range).
 *   - "Winner" highlights apply only when at least 2 columns are present and
 *     the metric is comparable (non-null on every column).
 *   - Removing the last column resets to the empty state without crashing.
 *
 * Read order:
 *   1. computeWinners()           — pure helper, drives the highlight logic
 *   2. CompareClient state        — properties + verdict + add-search panel
 *   3. ComparisonRow()            — one row across all columns
 *   4. EmptyState() / AddPanel()  — fallback + modal-less search dialog
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PropertyImage } from "@/components/ui/PropertyImage";
import {
  gqlAskAgent,
  gqlSearchPropertiesByQuery,
  type ApiProperty,
} from "@/lib/graphql-client";

export interface CompareClientProps {
  initialProperties: ApiProperty[];
  initialIds: string[];
  maxCompare: number;
}

type WinnerKey =
  | "price"
  | "pricePerSqft"
  | "aiScore"
  | "areaSqft"
  | "livability"
  | "connectivity"
  | "schools"
  | "safety";

type WinnerMap = Partial<Record<WinnerKey, string>>;

/**
 * Returns a map from metric → property id of the "winner" for that metric.
 * Lower is better for price/pricePerSqft; higher is better for everything else.
 * Returns no entry for a metric when the metric is not comparable (e.g. only
 * one property has the value).
 */
function computeWinners(properties: ApiProperty[]): WinnerMap {
  if (properties.length < 2) return {};
  const out: WinnerMap = {};

  function pick(
    key: WinnerKey,
    higherIsBetter: boolean,
    extractor: (p: ApiProperty) => number | null,
  ) {
    const values = properties
      .map((p) => ({ id: p.id, v: extractor(p) }))
      .filter((x): x is { id: string; v: number } => x.v != null && Number.isFinite(x.v));
    if (values.length < 2) return;
    const winner = values.reduce((acc, cur) => {
      if (higherIsBetter) return cur.v > acc.v ? cur : acc;
      return cur.v < acc.v ? cur : acc;
    }, values[0]);
    out[key] = winner.id;
  }

  pick("price", false, (p) => Number(p.price) || null);
  pick("pricePerSqft", false, (p) =>
    p.areaSqft && p.price ? Number(p.price) / Number(p.areaSqft) : null,
  );
  pick("aiScore", true, (p) => (p.aiScore != null ? Number(p.aiScore) : null));
  pick("areaSqft", true, (p) => (p.areaSqft != null ? Number(p.areaSqft) : null));
  pick("livability", true, (p) => p.areaScores?.livabilityScore ?? null);
  pick("connectivity", true, (p) => p.areaScores?.connectivityScore ?? null);
  pick("schools", true, (p) => p.areaScores?.schoolsScore ?? null);
  pick("safety", true, (p) => p.areaScores?.safetyScore ?? null);
  return out;
}

function fmtInr(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)} L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function fmtPricePerSqft(p: ApiProperty): string {
  if (!p.areaSqft || !p.price) return "—";
  return `₹${Math.round(Number(p.price) / Number(p.areaSqft)).toLocaleString("en-IN")}/sqft`;
}

function fmtScore(v: number | null | undefined, suffix = "/100"): string {
  return v == null ? "—" : `${v}${suffix}`;
}

export function CompareClient({
  initialProperties,
  initialIds,
  maxCompare,
}: CompareClientProps) {
  const router = useRouter();
  const [properties, setProperties] = React.useState<ApiProperty[]>(initialProperties);
  const [verdict, setVerdict] = React.useState<string | null>(null);
  const [verdictLoading, setVerdictLoading] = React.useState(false);
  const [verdictError, setVerdictError] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const winners = React.useMemo(() => computeWinners(properties), [properties]);
  const ids = React.useMemo(() => properties.map((p) => p.id), [properties]);

  const syncUrl = React.useCallback(
    (nextIds: string[]) => {
      const qs = nextIds.length > 0 ? `?ids=${nextIds.join(",")}` : "";
      router.replace(`/compare${qs}`, { scroll: false });
    },
    [router],
  );

  function removeProperty(id: string) {
    const next = properties.filter((p) => p.id !== id);
    setProperties(next);
    setVerdict(null);
    syncUrl(next.map((p) => p.id));
  }

  function appendProperty(p: ApiProperty) {
    if (properties.find((x) => x.id === p.id)) return;
    if (properties.length >= maxCompare) return;
    const next = [...properties, p];
    setProperties(next);
    setVerdict(null);
    syncUrl(next.map((p) => p.id));
  }

  async function getAiVerdict() {
    if (properties.length < 2) return;
    setVerdictLoading(true);
    setVerdictError(null);
    setVerdict(null);
    try {
      const propertyList = properties
        .map((p, i) => `[${i + 1}] ${p.title} — ${p.location} — ₹${Number(p.price).toLocaleString("en-IN")} (id: ${p.id})`)
        .join("\n");
      const prompt =
        "Compare these properties using the compare_properties tool, then give a clear, opinionated verdict. " +
        "Highlight: which is the best value, which has the strongest location, and any deal-breakers. " +
        "Use bullet points and finish with a 1-line recommendation.\n\n" +
        propertyList;

      const result = await gqlAskAgent({ prompt });
      setVerdict(result.answer);
    } catch (err) {
      setVerdictError(
        err instanceof Error
          ? err.message
          : "Could not get an AI verdict right now. Please try again.",
      );
    } finally {
      setVerdictLoading(false);
    }
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        initialIdsAttempted={initialIds.length}
        onPropertyChosen={(p) => appendProperty(p)}
      />
    );
  }

  const remaining = maxCompare - properties.length;

  return (
    <div className="compare-wrap" style={{ padding: "32px 0 80px" }}>
      <header
        className="compare-hero"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 28px 24px",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            className="eyebrow"
            style={{
              color: "var(--teal)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            ✦ AI Comparison
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 600,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Comparing {properties.length} {properties.length === 1 ? "property" : "properties"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, maxWidth: 640 }}>
            Side-by-side metrics, locality scores, and an opinionated AI verdict.
            Best values are highlighted in <span style={{ color: "var(--teal)", fontWeight: 600 }}>teal</span>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {remaining > 0 ? (
            <Button variant="outline" size="default" onClick={() => setAddOpen(true)}>
              + Add property ({remaining} left)
            </Button>
          ) : (
            <Badge variant="glass">Max {maxCompare} reached</Badge>
          )}
          <Button
            variant="default"
            size="default"
            onClick={getAiVerdict}
            disabled={verdictLoading || properties.length < 2}
            data-testid="compare-ai-verdict"
          >
            {verdictLoading ? "Thinking…" : "✦ Get AI verdict"}
          </Button>
        </div>
      </header>

      {addOpen ? (
        <AddPanel
          existingIds={ids}
          onClose={() => setAddOpen(false)}
          onPick={(p) => {
            appendProperty(p);
            setAddOpen(false);
          }}
        />
      ) : null}

      {verdictError ? (
        <div
          role="alert"
          style={{
            margin: "24px 28px 0",
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,107,74,0.35)",
            background: "var(--coral-dim)",
            color: "var(--coral)",
            fontSize: 14,
          }}
        >
          {verdictError}
        </div>
      ) : null}

      {verdict ? (
        <section
          aria-labelledby="ai-verdict-heading"
          style={{
            margin: "24px 28px 0",
            padding: "20px 24px",
            borderRadius: 16,
            border: "1px solid rgba(0,212,170,0.25)",
            background:
              "linear-gradient(135deg, var(--teal-dim), rgba(0,212,170,0.04))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Badge variant="teal">✦ AI Verdict</Badge>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Generated with the compare_properties tool
            </span>
          </div>
          <h2
            id="ai-verdict-heading"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              marginBottom: 8,
            }}
          >
            What the AI thinks
          </h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>
            {verdict}
          </p>
        </section>
      ) : null}

      <section
        aria-label="Property comparison table"
        style={{
          marginTop: 28,
          padding: "0 28px",
          overflowX: "auto",
          paddingBottom: 32,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${properties.length}, minmax(260px, 1fr))`,
            gap: 0,
            minWidth: `${200 + properties.length * 260}px`,
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--card)",
          }}
        >
          <div style={{ padding: 16, fontSize: 12, color: "var(--text-muted)" }} />
          {properties.map((p) => (
            <PropertyHeader
              key={p.id}
              property={p}
              onRemove={() => removeProperty(p.id)}
              showRemove={properties.length > 1}
            />
          ))}

          <ComparisonRow
            label="Price"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtInr(Number(p.price)),
              winner: winners.price === p.id,
            }))}
          />
          <ComparisonRow
            label="Price / sqft"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtPricePerSqft(p),
              winner: winners.pricePerSqft === p.id,
            }))}
          />
          <ComparisonRow
            label="BHK"
            cells={properties.map((p) => ({ id: p.id, value: `${p.bedrooms} BHK` }))}
          />
          <ComparisonRow
            label="Bathrooms"
            cells={properties.map((p) => ({ id: p.id, value: String(p.bathrooms ?? "—") }))}
          />
          <ComparisonRow
            label="Carpet area"
            cells={properties.map((p) => ({
              id: p.id,
              value: p.areaSqft ? `${p.areaSqft.toLocaleString("en-IN")} sqft` : "—",
              winner: winners.areaSqft === p.id,
            }))}
          />
          <ComparisonRow
            label="Type"
            cells={properties.map((p) => ({ id: p.id, value: p.type ?? "—" }))}
          />
          <ComparisonRow
            label="Status"
            cells={properties.map((p) => ({ id: p.id, value: p.status ?? "—" }))}
          />
          <ComparisonRow
            label="AI score"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtScore(p.aiScore ?? null),
              winner: winners.aiScore === p.id,
              accent: p.aiScore != null && p.aiScore >= 90 ? "gold" : undefined,
            }))}
          />
          <ComparisonRow
            label="Verified listing"
            cells={properties.map((p) => ({
              id: p.id,
              value: p.isVerified ? "Yes" : "—",
              accent: p.isVerified ? "teal" : undefined,
            }))}
          />
          <ComparisonRow
            label="Price drop"
            cells={properties.map((p) => ({
              id: p.id,
              value:
                p.priceDropPercent != null && p.priceDropPercent > 0
                  ? `▼ ${p.priceDropPercent}%`
                  : "—",
              accent:
                p.priceDropPercent != null && p.priceDropPercent > 0 ? "coral" : undefined,
            }))}
          />
          <SectionDivider label="Locality intelligence" />
          <ComparisonRow
            label="Livability"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtScore(p.areaScores?.livabilityScore ?? null),
              winner: winners.livability === p.id,
            }))}
          />
          <ComparisonRow
            label="Connectivity"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtScore(p.areaScores?.connectivityScore ?? null),
              winner: winners.connectivity === p.id,
            }))}
          />
          <ComparisonRow
            label="Schools"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtScore(p.areaScores?.schoolsScore ?? null),
              winner: winners.schools === p.id,
            }))}
          />
          <ComparisonRow
            label="Safety"
            cells={properties.map((p) => ({
              id: p.id,
              value: fmtScore(p.areaScores?.safetyScore ?? null),
              winner: winners.safety === p.id,
            }))}
          />
          <ComparisonRow
            label="Annual price trend"
            cells={properties.map((p) => ({
              id: p.id,
              value:
                p.areaScores?.priceTrendPctAnnual != null
                  ? `${p.areaScores.priceTrendPctAnnual > 0 ? "+" : ""}${p.areaScores.priceTrendPctAnnual}%`
                  : "—",
            }))}
          />
        </div>
      </section>

      <p
        style={{
          marginTop: 24,
          padding: "0 28px",
          color: "var(--text-muted)",
          fontSize: 13,
          maxWidth: 760,
        }}
      >
        ✦ Tip: Share this comparison by copying the URL — selections are saved
        in the link. Click any property header to view its full detail page.
      </p>
    </div>
  );
}

interface PropertyHeaderProps {
  property: ApiProperty;
  onRemove: () => void;
  showRemove: boolean;
}

function PropertyHeader({ property, onRemove, showRemove }: PropertyHeaderProps) {
  return (
    <div
      style={{
        padding: 16,
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--dark-3)",
        }}
      >
        <PropertyImage
          src={property.coverImageUrl ?? property.imageUrls?.[0] ?? null}
          alt={property.title}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {property.isVerified ? (
            <Badge variant="teal" data-testid="compare-verified-badge">✓ Verified</Badge>
          ) : null}
          {property.aiScore != null && property.aiScore >= 90 ? (
            <Badge variant="gold">✦ AI Pick</Badge>
          ) : null}
        </div>
        {showRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${property.title} from comparison`}
            title="Remove"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.45)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              backdropFilter: "blur(6px)",
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      <Link
        href={`/property/${property.id}`}
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text)",
          textDecoration: "none",
          lineHeight: 1.25,
        }}
      >
        {property.title}
      </Link>
      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{property.location}</div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  cells: Array<{
    id: string;
    value: string;
    winner?: boolean;
    accent?: "teal" | "gold" | "coral";
  }>;
}

function ComparisonRow({ label, cells }: ComparisonRowProps) {
  return (
    <>
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: "var(--dark-2)",
        }}
      >
        {label}
      </div>
      {cells.map((cell) => {
        const accentColor =
          cell.accent === "teal"
            ? "var(--teal)"
            : cell.accent === "gold"
              ? "var(--gold)"
              : cell.accent === "coral"
                ? "var(--coral)"
                : undefined;
        return (
          <div
            key={cell.id + label}
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              borderLeft: "1px solid var(--border)",
              fontSize: 14,
              color: cell.winner ? "var(--teal)" : accentColor ?? "var(--text)",
              fontWeight: cell.winner || cell.accent ? 600 : 400,
              background: cell.winner
                ? "rgba(0,212,170,0.06)"
                : "transparent",
            }}
          >
            {cell.value}
            {cell.winner ? (
              <span
                aria-label="Best in row"
                title="Best in row"
                style={{ marginLeft: 6, fontSize: 11, color: "var(--teal)" }}
              >
                ★
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        padding: "16px 16px 8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--teal)",
        borderTop: "1px solid var(--border)",
        background: "var(--dark-2)",
      }}
    >
      {label}
    </div>
  );
}

interface AddPanelProps {
  existingIds: string[];
  onPick: (p: ApiProperty) => void;
  onClose: () => void;
}

function AddPanel({ existingIds, onPick, onClose }: AddPanelProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ApiProperty[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function search(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await gqlSearchPropertiesByQuery(q);
      setResults(res.filter((p) => !existingIds.includes(p.id)).slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Add property to comparison"
      style={{
        margin: "24px 28px 0",
        padding: 20,
        borderRadius: 16,
        border: "1px solid var(--glass-border)",
        background: "var(--glass)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Add property to compare</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 3 BHK in Whitefield, or paste a property ID"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--dark-3)",
            color: "var(--text)",
            fontSize: 14,
          }}
        />
        <Button type="submit" size="default" disabled={loading || !query.trim()}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </form>
      {error ? (
        <p style={{ marginTop: 10, color: "var(--coral)", fontSize: 13 }}>{error}</p>
      ) : null}
      {results.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 8 }}>
          {results.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 64,
                  height: 48,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "var(--dark-3)",
                  flex: "0 0 auto",
                }}
              >
                <PropertyImage src={p.coverImageUrl ?? p.imageUrls?.[0] ?? null} alt={p.title} fill sizes="64px" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {p.location} · {fmtInr(Number(p.price))}
                </div>
              </div>
              <Button size="sm" variant="teal" onClick={() => onPick(p)}>
                Add
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  initialIdsAttempted: number;
  onPropertyChosen: (p: ApiProperty) => void;
}

function EmptyState({ initialIdsAttempted, onPropertyChosen }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: "80px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <Badge variant="teal">✦ AI Comparison</Badge>
      <h1
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        Compare properties side by side
      </h1>
      <p style={{ color: "var(--text-muted)", maxWidth: 560, lineHeight: 1.6 }}>
        Pick 2–5 listings to see price-per-sqft, locality scores, verified-listing
        signals, and an opinionated AI verdict — all in one view.
        {initialIdsAttempted > 0
          ? " The properties from your link could not be loaded — try adding them again below."
          : ""}
      </p>
      <div style={{ width: "min(560px, 100%)" }}>
        <AddPanel existingIds={[]} onClose={() => undefined} onPick={onPropertyChosen} />
      </div>
      <Link
        href="/search"
        style={{ color: "var(--teal)", textDecoration: "none", fontWeight: 600 }}
      >
        Browse all properties →
      </Link>
    </div>
  );
}
