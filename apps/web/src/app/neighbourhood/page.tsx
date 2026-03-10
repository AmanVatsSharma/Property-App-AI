/**
 * @file page.tsx
 * @module app/neighbourhood
 * @description Neighbourhood Score Explorer
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neighbourhood Score Explorer — UrbanNest.ai",
  description: "Compare localities, check livability scores, and explore neighbourhood insights.",
};

export default function NeighbourhoodPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">Neighbourhood <em className="teal">Score Explorer</em></h1>
        <p className="sub">Compare localities on safety, commute, schools, hospitals, and 40+ signals. Make informed decisions.</p>
      </div>
      <div style={{ padding: "40px 52px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          {["Mumbai", "Bangalore", "Delhi NCR", "Hyderabad", "Pune", "Chennai"].map((city) => (
            <button key={city} type="button" className={city === "Bangalore" ? "tab active" : "tab"} style={{ padding: "9px 20px" }}>{city}</button>
          ))}
        </div>
        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 className="h3" style={{ marginBottom: 8 }}>Locality A</h3>
            <select className="select" style={{ marginBottom: 16 }}><option>Whitefield, Bangalore</option></select>
            <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 64, fontWeight: 700, color: "var(--teal)", letterSpacing: -2 }}>87</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Overall Livability Score</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 className="h3" style={{ marginBottom: 8 }}>Locality B</h3>
            <select className="select" style={{ marginBottom: 16 }}><option>Koramangala, Bangalore</option></select>
            <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 64, fontWeight: 700, color: "var(--teal)", letterSpacing: -2 }}>84</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Overall Livability Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
