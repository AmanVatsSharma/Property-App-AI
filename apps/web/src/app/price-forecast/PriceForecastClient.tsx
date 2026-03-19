/**
 * @file PriceForecastClient.tsx
 * @module app/price-forecast
 * @description Live price forecast UI; fetches GET /api/v1/price-forecast.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useState, useCallback } from "react";
import { apiGet, ApiError } from "@/lib/api-client";

interface ForecastResult {
  locality: string;
  city: string;
  forecast12m: number;
  forecast24m: number;
  forecast36m: number;
  demandSignal: "low" | "medium" | "high" | "surge";
  rationale: string;
  confidence: "low" | "medium" | "high";
  lastUpdated: string;
}

const SIGNAL_COLORS: Record<ForecastResult["demandSignal"], string> = {
  low: "var(--text-muted)",
  medium: "var(--gold)",
  high: "var(--teal)",
  surge: "var(--coral)",
};

const CONFIDENCE_LABEL: Record<ForecastResult["confidence"], string> = {
  low: "⚠ Low confidence — limited data",
  medium: "◑ Medium confidence",
  high: "✓ High confidence",
};

function ForecastBar({
  label,
  value,
  max = 50,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    value >= 15 ? "var(--teal)" : value >= 8 ? "var(--gold)" : "var(--text-muted)";
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color }}>
          +{value.toFixed(1)}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 100,
          background: "var(--dark-3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 100,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            transition: "width 1s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      </div>
    </div>
  );
}

const POPULAR = [
  { locality: "Whitefield", city: "Bangalore" },
  { locality: "Koramangala", city: "Bangalore" },
  { locality: "Baner", city: "Pune" },
  { locality: "Gachibowli", city: "Hyderabad" },
  { locality: "Sector 49", city: "Gurgaon" },
];

export default function PriceForecastClient() {
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const fetchForecast = useCallback(
    async (loc: string, cit: string) => {
      if (!loc.trim()) return;
      if (!baseUrl) {
        setError("Backend not configured. Set NEXT_PUBLIC_API_URL.");
        return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const params = new URLSearchParams({
          locality: loc.trim(),
          city: cit.trim(),
          horizon: "24",
        });
        const data = await apiGet<ForecastResult>(
          `api/v1/price-forecast?${params}`,
        );
        setResult(data);
      } catch (e) {
        setError(
          e instanceof ApiError
            ? `Error ${e.status}: ${e.statusText}`
            : e instanceof Error
              ? e.message
              : "Request failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchForecast(locality, city);
  };

  return (
    <div style={{ padding: "40px 52px 80px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        <div className="card" style={{ padding: 28 }}>
          <h3 className="h3" style={{ marginBottom: 6 }}>
            Forecast a locality
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Enter any Indian locality to get an AI-powered price forecast.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label" htmlFor="locality">
                Locality *
              </label>
              <input
                id="locality"
                className="input"
                placeholder="e.g. Whitefield"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
                style={{ marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label" htmlFor="city">
                City
              </label>
              <input
                id="city"
                className="input"
                placeholder="e.g. Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "13px" }}
              disabled={loading || !locality.trim()}
            >
              {loading ? "Analysing…" : "Get Forecast ✦"}
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              Popular localities
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {POPULAR.map((p) => (
                <button
                  key={`${p.locality}-${p.city}`}
                  type="button"
                  className="suggest-chip"
                  onClick={() => {
                    setLocality(p.locality);
                    setCity(p.city);
                    fetchForecast(p.locality, p.city);
                  }}
                  style={{ fontSize: 11 }}
                >
                  {p.locality}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {!result && !loading && !error && (
            <div
              className="card"
              style={{
                padding: 48,
                textAlign: "center",
                background: "var(--glass)",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Select a locality to see its price forecast
              </p>
            </div>
          )}

          {loading && (
            <div className="card" style={{ padding: 48, textAlign: "center" }}>
              <div
                className="loading-spinner"
                style={{ margin: "0 auto 16px" }}
              />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Analysing market signals for {locality}…
              </p>
            </div>
          )}

          {error && !loading && (
            <div
              className="card"
              style={{
                padding: 24,
                background: "var(--coral-dim)",
                border: "1px solid rgba(255,107,74,0.2)",
                color: "var(--coral)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                className="card"
                style={{
                  padding: 28,
                  background:
                    "linear-gradient(135deg, rgba(0,212,170,0.06), var(--dark-2))",
                  border: "1px solid rgba(0,212,170,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div className="eyebrow">Price Forecast</div>
                    <h2 className="h2" style={{ marginTop: 4 }}>
                      {result.locality}
                      {result.city ? `, ${result.city}` : ""}
                    </h2>
                  </div>
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: 100,
                      background: "var(--teal-dim)",
                      border: "1px solid rgba(0,212,170,0.2)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: SIGNAL_COLORS[result.demandSignal],
                    }}
                  >
                    {result.demandSignal.toUpperCase()} DEMAND
                  </div>
                </div>

                <ForecastBar
                  label="12-month appreciation"
                  value={result.forecast12m}
                />
                <ForecastBar
                  label="24-month appreciation"
                  value={result.forecast24m}
                />
                <ForecastBar
                  label="36-month appreciation"
                  value={result.forecast36m}
                />
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>
                  AI Analysis
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {result.rationale}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: "var(--text-dim)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{CONFIDENCE_LABEL[result.confidence]}</span>
                  <span>
                    Updated{" "}
                    {new Date(result.lastUpdated).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                ⚠ Forecasts are AI-generated estimates based on market patterns
                and should not be treated as financial advice. Always consult a
                registered advisor before investing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
