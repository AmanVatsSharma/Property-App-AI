/**
 * @file SearchPageClient.tsx
 * @module search
 * @description Search page client content — filters, grid, pagination
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import Link from "next/link";
import { useState } from "react";

const PROPERTIES = [
  { price: "₹2.85 Cr", name: "Sobha City Vista — 4 BHK Ultra Luxury", loc: "Sector 108, Gurgaon · 2,850 sqft", specs: ["4 BHK", "4 Bath", "2 Park", "RERA"], tip: "18% appreciation expected. Metro 1.2km. Priced 8% below market.", badges: ["badge-gold", "badge-teal"], badgeLabels: ["⭐ Premium", "✦ AI Pick"], score: 94, bg: "linear-gradient(135deg,#132238,#1e3a5f)" },
  { price: "₹78 L", name: "DLF MyPad — 2 BHK Studio, Noida", loc: "Sector 59, Noida · 1,100 sqft", specs: ["2 BHK", "2 Bath", "1,100"], tip: "Best value in locality. 92% of seekers shortlisted this.", badges: ["badge-green", "badge-coral"], badgeLabels: ["✓ Verified", "🔥 Hot"], score: 88, bg: "linear-gradient(135deg,#1a2e1a,#2a4a2a)" },
  { price: "₹1.45 Cr", name: "M3M Golf Hills — 3 BHK Premium", loc: "Sector 79, Gurgaon · 1,890 sqft", specs: ["3 BHK", "3 Bath", "1 Park"], tip: "37 views today. Price rising after DDJK highway opens Q2.", badges: ["badge-white", "badge-teal"], badgeLabels: ["NEW", "✦ AI Pick"], score: 91, bg: "linear-gradient(135deg,#1a1a30,#2a2a50)" },
  { price: "₹62 L", name: "Prestige Sunrise Park — 2 BHK", loc: "Whitefield, Bangalore · 1,250 sqft", specs: ["2 BHK", "2 Bath", "RERA"], tip: "IT corridor adjacency. 28% YoY appreciation recorded.", badges: ["badge-gold"], badgeLabels: ["⭐ Featured"], score: 86, bg: "linear-gradient(135deg,#2a1a1a,#4a2a2a)" },
  { price: "₹95 L", name: "Brigade Cornerstone Utopia — 3 BHK", loc: "Yelahanka, Bangalore · 1,580 sqft", specs: ["3 BHK", "3 Bath", "Dec 2026"], tip: "Launch price — 22% gains likely at possession.", badges: ["badge-coral"], badgeLabels: ["Under Construction"], score: 79, bg: "linear-gradient(135deg,#1a2a1a,#253a25)" },
  { price: "₹1.8 Cr", name: "Godrej Meridian — 4 BHK, Gurgaon", loc: "Sector 106, Gurgaon · 2,200 sqft", specs: ["4 BHK", "4 Bath", "2 Park"], tip: "Golf course views. Excellent school access score of 88.", badges: ["badge-green"], badgeLabels: ["✓ Verified"], score: 83, bg: "linear-gradient(135deg,#0d1a2a,#162a3a)" },
];

export default function SearchPageClient() {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <>
      <div className="search-top-bar">
        <div className="search-query-box">
          <span style={{ color: "var(--teal)", fontSize: 16 }}>✦</span>
          <input className="search-q-input" placeholder="AI Search: 3BHK near metro under ₹1Cr in Gurgaon..." />
          <button type="button" style={{ background: "var(--teal)", border: "none", color: "var(--night)", padding: "6px 14px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Search</button>
        </div>
        <span className="results-meta" style={{ marginLeft: 20 }}>Showing <strong>2,847</strong> properties</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <select className="sort-select">
            <option>Sort: Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
            <option>AI Score</option>
          </select>
          <div className="view-toggle">
            <button type="button" className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} title="Grid view" onClick={() => setViewMode("grid")}>⊞</button>
            <button type="button" className={`vt-btn ${viewMode === "list" ? "active" : ""}`} title="List view" onClick={() => setViewMode("list")}>☰</button>
            <button type="button" className={`vt-btn ${viewMode === "map" ? "active" : ""}`} title="Map view" onClick={() => setViewMode("map")}>🗺️</button>
          </div>
        </div>
      </div>

      <div className="active-filters">
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>Filters:</span>
        <span className="af-tag">Gurgaon <span className="af-remove">×</span></span>
        <span className="af-tag">3 BHK <span className="af-remove">×</span></span>
        <span className="af-tag">Under ₹2Cr <span className="af-remove">×</span></span>
        <span className="af-tag">Ready to Move <span className="af-remove">×</span></span>
        <span className="af-tag">Verified <span className="af-remove">×</span></span>
        <button type="button" style={{ fontSize: 12, color: "var(--coral)", marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Clear all</button>
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
                <button key={t} type="button" className={`bhk-btn ${i === 0 ? "active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <div className="filter-title">Bedrooms (BHK)</div>
            <div className="bhk-grid">
              {["1", "2", "3", "4+"].map((b, i) => (
                <button key={b} type="button" className={`bhk-btn ${i === 2 ? "active" : ""}`}>{b}</button>
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
              <label className="checkbox-item"><input type="checkbox" defaultChecked /> Ready to Move</label>
              <label className="checkbox-item"><input type="checkbox" /> Under Construction</label>
              <label className="checkbox-item"><input type="checkbox" /> New Launch</label>
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
            <div className="prop-grid">
              {PROPERTIES.map((p, i) => (
                <Link key={i} href="/property/detail" className="prop-card reveal">
                  <div className="prop-img">
                    <div className="prop-img-bg" style={{ background: p.bg }} />
                    <div className="prop-emoji">🏡</div>
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
              <button type="button" className="page-btn">‹</button>
              <button type="button" className="page-btn active">1</button>
              <button type="button" className="page-btn">2</button>
              <button type="button" className="page-btn">3</button>
              <span style={{ color: "var(--text-dim)", padding: "0 4px", display: "flex", alignItems: "center" }}>…</span>
              <button type="button" className="page-btn">24</button>
              <button type="button" className="page-btn">›</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
