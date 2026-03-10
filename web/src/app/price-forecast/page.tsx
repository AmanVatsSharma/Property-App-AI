/**
 * @file page.tsx
 * @module app/price-forecast
 * @description Price Forecast — AI-powered property price prediction
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
        <h1 className="h1">Price <em className="teal">Forecast</em></h1>
        <p className="sub">ML model predicts 12–36 month appreciation based on infra projects, RERA data, demand trends, and macro signals. 89% accuracy.</p>
      </div>
      <div style={{ padding: "40px 52px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="h3" style={{ marginBottom: 18 }}>Select Locality</h3>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label className="label">City</label>
            <select className="select"><option>Bangalore</option></select>
          </div>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label className="label">Locality</label>
            <select className="select"><option>Whitefield</option><option>Koramangala</option></select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Forecast Horizon</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
              {["12 months", "24 months", "36 months"].map((h, i) => (
                <button key={h} type="button" className={i === 1 ? "tab active" : "tab"} style={{ padding: 10, textAlign: "center" }}>{h}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div className="eyebrow">Forecast Result</div>
          <h3 className="h3" style={{ marginBottom: 8 }}>Whitefield, Bangalore</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>24-month outlook</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { year: "Current", price: "₹12,500", gain: "" },
              { year: "12 mo", price: "₹13,200", gain: "+5.6%" },
              { year: "24 mo", price: "₹14,100", gain: "+12.8%", highlight: true },
              { year: "36 mo", price: "₹15,200", gain: "+21.6%" },
            ].map((r) => (
              <div key={r.year} className="card" style={{ padding: 16, textAlign: "center", borderColor: r.highlight ? "rgba(0,212,170,0.3)" : undefined, background: r.highlight ? "var(--teal-dim)" : undefined }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.year}</div>
                <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, fontWeight: 700, color: r.highlight ? "var(--teal)" : "var(--white)", marginTop: 4 }}>{r.price}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", marginTop: 4 }}>{r.gain}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
