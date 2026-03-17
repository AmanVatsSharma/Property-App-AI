/**
 * @file NeighbourhoodExplorerClient.tsx
 * @module app/neighbourhood
 * @description Client component for neighbourhood score explorer; fetches GET /api/v1/neighbourhood.
 * @author BharatERP
 * @created 2026-03-17
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiGet, ApiError } from "@/lib/api-client";

const CITIES = ["Mumbai", "Bangalore", "Delhi NCR", "Hyderabad", "Pune", "Chennai"] as const;
const LOCALITIES_BY_CITY: Record<string, string[]> = {
  Mumbai: ["Bandra West", "Andheri West", "Powai", "Worli", "Lower Parel"],
  Bangalore: ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout", "Electronic City"],
  "Delhi NCR": ["Dwarka", "Gurgaon", "Noida", "Saket", "Rohini"],
  Hyderabad: ["Gachibowli", "Jubilee Hills", "Madhapur", "Banjara Hills"],
  Pune: ["Koregaon Park", "Hinjewadi", "Baner", "Kothrud"],
  Chennai: ["Adyar", "Anna Nagar", "OMR", "T Nagar"],
};

export interface NeighbourhoodScoreResponse {
  locality: string;
  city: string;
  livabilityScore: number | null;
  connectivityScore: number | null;
  schoolsScore: number | null;
  safetyScore: number | null;
  priceTrendPctAnnual: number | null;
  amenitiesSummary: string | null;
  lastAssessedAt: string | null;
}

/** REST base URL: prefer API_URL; fallback to GraphQL URL with /graphql stripped so neighbourhood works with either env. */
function getBaseUrl(): string {
  if (typeof window === "undefined") return "";
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (api) return api;
  const gql = process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? "";
  if (gql) return gql.replace(/\/graphql\/?$/, "");
  return "";
}

type CardKey = "A" | "B";

interface CardState {
  city: string;
  locality: string;
  data: NeighbourhoodScoreResponse | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_LOCALITY = "Whitefield";
const DEFAULT_CITY = "Bangalore";

function ScoreCard({
  cardKey,
  title,
  city,
  locality,
  localities,
  onCityChange,
  onLocalityChange,
  data,
  loading,
  error,
  onFetch,
  apiUnavailable,
}: {
  cardKey: CardKey;
  title: string;
  city: string;
  locality: string;
  localities: string[];
  onCityChange: (v: string) => void;
  onLocalityChange: (v: string) => void;
  data: NeighbourhoodScoreResponse | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
  apiUnavailable: boolean;
}) {
  const score = data?.livabilityScore ?? null;
  return (
    <div className="card" style={{ padding: 24 }} data-testid={`neighbourhood-card-${cardKey}`}>
      <h3 className="h3" style={{ marginBottom: 8 }}>
        {title}
      </h3>
      <div className="form-field" style={{ marginBottom: 12 }}>
        <label htmlFor={`neighbourhood-city-${cardKey}`} className="label">
          City
        </label>
        <select
          id={`neighbourhood-city-${cardKey}`}
          className="select"
          style={{ marginTop: 4 }}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={apiUnavailable}
          aria-label={`${title} city`}
          data-testid={`neighbourhood-city-${cardKey}`}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field" style={{ marginBottom: 16 }}>
        <label htmlFor={`neighbourhood-locality-${cardKey}`} className="label">
          Locality
        </label>
        <select
          id={`neighbourhood-locality-${cardKey}`}
          className="select"
          style={{ marginTop: 4 }}
          value={locality}
          onChange={(e) => onLocalityChange(e.target.value)}
          disabled={apiUnavailable}
          aria-label={`${title} locality`}
          data-testid={`neighbourhood-locality-${cardKey}`}
        >
          {localities.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      {apiUnavailable && (
        <div
          role="status"
          className="card"
          style={{
            padding: 20,
            background: "var(--glass)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
          data-testid="neighbourhood-connect-api"
        >
          Connect API — set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_GRAPHQL_HTTP to see live scores.
        </div>
      )}
      {!apiUnavailable && loading && (
        <div
          className="loading-spinner"
          style={{ margin: "24px auto", display: "block" }}
          aria-hidden
          data-testid={`neighbourhood-loading-${cardKey}`}
        />
      )}
      {!apiUnavailable && !loading && error && (
        <div
          role="alert"
          style={{
            padding: 16,
            background: "var(--coral-dim)",
            border: "1px solid rgba(255,107,74,0.2)",
            borderRadius: "var(--radius-sm)",
            color: "var(--coral)",
            fontSize: 13,
          }}
          data-testid={`neighbourhood-error-${cardKey}`}
        >
          {error}
        </div>
      )}
      {!apiUnavailable && !loading && !error && (
        <>
          <div
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 64,
              fontWeight: 700,
              color: "var(--teal)",
              letterSpacing: -2,
            }}
            data-testid={`neighbourhood-score-${cardKey}`}
          >
            {score != null ? score : "—"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Overall Livability Score
          </div>
          <button
            type="button"
            className="tab"
            style={{ marginTop: 16, padding: "9px 20px" }}
            onClick={onFetch}
            disabled={loading}
            aria-label={`Refresh ${title} score`}
            data-testid={`neighbourhood-refresh-${cardKey}`}
          >
            Refresh
          </button>
        </>
      )}
    </div>
  );
}

export function NeighbourhoodExplorerClient() {
  const baseUrl = typeof window !== "undefined" ? getBaseUrl() : "";
  const [cardA, setCardA] = useState<CardState>({
    city: DEFAULT_CITY,
    locality: DEFAULT_LOCALITY,
    data: null,
    loading: false,
    error: null,
  });
  const [cardB, setCardB] = useState<CardState>({
    city: DEFAULT_CITY,
    locality: "Koramangala",
    data: null,
    loading: false,
    error: null,
  });
  const [activeCityTab, setActiveCityTab] = useState<string>(DEFAULT_CITY);

  const fetchScore = useCallback(async (key: CardKey, city: string, locality: string) => {
    const url = `api/v1/neighbourhood?${new URLSearchParams({
      locality: locality.trim(),
      city: city.trim() || "",
    }).toString()}`;
    if (key === "A") {
      setCardA((prev) => ({ ...prev, loading: true, error: null }));
    } else {
      setCardB((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const data = await apiGet<NeighbourhoodScoreResponse>(url);
      if (key === "A") {
        setCardA((prev) => ({ ...prev, data, loading: false, error: null }));
      } else {
        setCardB((prev) => ({ ...prev, data, loading: false, error: null }));
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.body && typeof e.body === "object" && "message" in e.body
            ? String((e.body as { message: unknown }).message)
            : `${e.status} ${e.statusText}`
          : e instanceof Error
            ? e.message
            : "Request failed";
      if (key === "A") {
        setCardA((prev) => ({ ...prev, data: null, loading: false, error: message }));
      } else {
        setCardB((prev) => ({ ...prev, data: null, loading: false, error: message }));
      }
    }
  }, []);

  const listA = LOCALITIES_BY_CITY[cardA.city] ?? [];
  const localitiesA = listA.includes(cardA.locality) ? listA : [cardA.locality, ...listA];
  const listB = LOCALITIES_BY_CITY[cardB.city] ?? [];
  const localitiesB = listB.includes(cardB.locality) ? listB : [cardB.locality, ...listB];

  const apiUnavailable = !baseUrl || baseUrl.trim() === "";

  useEffect(() => {
    if (apiUnavailable) return;
    fetchScore("A", cardA.city, cardA.locality);
  }, [apiUnavailable, cardA.city, cardA.locality, fetchScore]);
  useEffect(() => {
    if (apiUnavailable) return;
    fetchScore("B", cardB.city, cardB.locality);
  }, [apiUnavailable, cardB.city, cardB.locality, fetchScore]);

  return (
    <div style={{ padding: "40px 52px" }} data-testid="neighbourhood-explorer">
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        {CITIES.map((city) => (
          <button
            key={city}
            type="button"
            className={activeCityTab === city ? "tab active" : "tab"}
            style={{ padding: "9px 20px" }}
            onClick={() => setActiveCityTab(city)}
            aria-pressed={activeCityTab === city}
            aria-label={`Filter by ${city}`}
            data-testid={`neighbourhood-city-tab-${city.replace(/\s/g, "-")}`}
          >
            {city}
          </button>
        ))}
      </div>
      <div className="grid-2" style={{ gap: 20 }}>
        <ScoreCard
          cardKey="A"
          title="Locality A"
          city={cardA.city}
          locality={cardA.locality}
          localities={localitiesA}
          onCityChange={(city) =>
            setCardA((prev) => ({
              ...prev,
              city,
              locality: (LOCALITIES_BY_CITY[city] ?? [prev.locality])[0] ?? prev.locality,
            }))
          }
          onLocalityChange={(locality) => setCardA((prev) => ({ ...prev, locality }))}
          data={cardA.data}
          loading={cardA.loading}
          error={cardA.error}
          onFetch={() => fetchScore("A", cardA.city, cardA.locality)}
          apiUnavailable={apiUnavailable}
        />
        <ScoreCard
          cardKey="B"
          title="Locality B"
          city={cardB.city}
          locality={cardB.locality}
          localities={localitiesB}
          onCityChange={(city) =>
            setCardB((prev) => ({
              ...prev,
              city,
              locality: (LOCALITIES_BY_CITY[city] ?? [prev.locality])[0] ?? prev.locality,
            }))
          }
          onLocalityChange={(locality) => setCardB((prev) => ({ ...prev, locality }))}
          data={cardB.data}
          loading={cardB.loading}
          error={cardB.error}
          onFetch={() => fetchScore("B", cardB.city, cardB.locality)}
          apiUnavailable={apiUnavailable}
        />
      </div>
      {!apiUnavailable && (
        <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Select city and locality, then use Refresh to load scores from the API.
        </p>
      )}
    </div>
  );
}
