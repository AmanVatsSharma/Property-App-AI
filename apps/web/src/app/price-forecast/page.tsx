/**
 * @file page.tsx
 * @module app/price-forecast
 * @description Price Forecast — placeholder until API is ready; no mock data.
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price Forecast — UrbanNest.ai",
  description: "ML-powered 12–36 month price appreciation forecasts for any locality.",
};

export default function PriceForecastPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">
          Price <em className="teal">Forecast</em>
        </h1>
        <p className="sub">
          ML model predicts 12–36 month appreciation based on infra projects, RERA data, demand trends, and macro signals.
        </p>
      </div>
      <div
        className="card"
        style={{
          margin: "0 52px 40px",
          padding: 48,
          textAlign: "center",
          background: "var(--glass)",
          border: "1px solid var(--border)",
        }}
        data-testid="price-forecast-coming-soon"
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--teal)",
            marginBottom: 12,
          }}
        >
          Coming soon
        </p>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
          Price forecast will use real data when the API is ready. No static or mock figures are shown.
        </p>
      </div>
    </div>
  );
}
