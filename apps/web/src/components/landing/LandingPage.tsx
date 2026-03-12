/**
 * @file LandingPage.tsx
 * @module landing
 * @description Landing page content with hero, search, city, listings, etc.
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { DEMO_IMAGES } from "@/lib/demo-images";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { SEARCH_TABS } from "@property-app-ai/shared";
import { useAIFab } from "@/components/providers/AIFabProvider";

const PLACEHOLDERS = [
  "Describe your home... e.g. 3BHK near good school, walkable to metro, budget ₹1.2Cr in Pune",
  "2BHK investment property with high rental yield in Hyderabad...",
  "Luxury villa with pool in Gurgaon under ₹4Cr...",
  "1BHK near IT park in Whitefield Bangalore under ₹50L...",
];

const CITIES = [
  { name: "Mumbai", count: "4.2L+ listings", trend: "↑ 22% YoY growth", emoji: "🌆", bg: "linear-gradient(135deg,#1a2340,#0d1626)" },
  { name: "Bangalore", count: "3.8L+ listings", trend: "↑ 31% YoY growth", emoji: "🏙️", bg: "linear-gradient(135deg,#1a2916,#0d1e0d)" },
  { name: "Delhi NCR", count: "5.1L+ listings", trend: "↑ 18% YoY growth", emoji: "🗼", bg: "linear-gradient(135deg,#291a2a,#1a0d1e)" },
  { name: "Hyderabad", count: "2.6L+ listings", trend: "↑ 27% YoY growth", emoji: "🌃", bg: "linear-gradient(135deg,#1a2921,#0d1e13)" },
  { name: "Pune", count: "1.9L+ listings", trend: "↑ 24% YoY growth", emoji: "🌇", bg: "linear-gradient(135deg,#261a12,#1a0d06)" },
  { name: "Chennai", count: "1.4L+ listings", trend: "↑ 15% YoY growth", emoji: "🏛️", bg: "linear-gradient(135deg,#121a26,#060d1a)" },
];

export default function LandingPage() {
  const { setOpen: openAIPanel } = useAIFab();
  const [activeTab, setActiveTab] = useState("buy");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [hearts, setHearts] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false });

  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const toggleHeart = (i: number) => {
    setHearts((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <>
      <section className="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="skyline">
          <svg viewBox="0 0 1400 260" preserveAspectRatio="xMidYMax meet" fill="rgba(0,212,170,0.8)">
            <rect x="0" y="120" width="60" height="140" />
            <rect x="20" y="80" width="20" height="180" />
            <rect x="70" y="140" width="40" height="120" />
            <rect x="120" y="60" width="50" height="200" />
            <rect x="180" y="100" width="30" height="160" />
            <rect x="220" y="70" width="60" height="190" />
            <rect x="290" y="120" width="40" height="140" />
            <rect x="340" y="50" width="70" height="210" />
            <rect x="420" y="90" width="50" height="170" />
            <rect x="525" y="60" width="55" height="200" />
            <rect x="590" y="110" width="45" height="150" />
            <rect x="645" y="40" width="65" height="220" />
            <rect x="720" y="80" width="50" height="180" />
            <rect x="830" y="55" width="60" height="205" />
            <rect x="900" y="100" width="45" height="160" />
            <rect x="1020" y="120" width="40" height="140" />
            <rect x="1070" y="45" width="70" height="215" />
            <rect x="1150" y="90" width="50" height="170" />
            <rect x="1320" y="80" width="45" height="180" />
          </svg>
        </div>
        <div className="hero-content">
          <div className="hero-pill">
            <div className="pill-live">
              <div className="pill-dot" /> Live Market Data
            </div>
            India&apos;s Most Intelligent Real Estate Platform
          </div>
          <h1>
            Search Smarter.
            <br />
            <span className="line-teal">Buy Better.</span>
            <br />
            <span className="line-outline">Live Richer.</span>
          </h1>
          <p className="hero-sub">
            UrbanNest.ai is powered by advanced AI that understands what you actually want — not just keywords. Get verified listings, real price intelligence, and neighbourhood insights across 340+ Indian cities.
          </p>
          <p className="hero-sub" style={{ marginTop: 8, marginBottom: 16 }}>
            Describe what you want in plain language — search properties or post your own listing. Our AI handles the rest.
          </p>
          <button
            type="button"
            onClick={() => openAIPanel(true)}
            className="btn-outline"
            style={{ marginBottom: 24, padding: "12px 24px" }}
          >
            Try AI
          </button>
          <div className="search-mega">
            <div className="search-card">
              <div className="search-tabs-row">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? "stab active" : "stab"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="stab-dot" /> {tab.label}
                  </button>
                ))}
              </div>
              <div className="search-row">
                <div className="search-ai-badge">✦ AI</div>
                <div className="search-divider" />
                <input
                  className="search-field"
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  aria-label="Search properties"
                />
                <div className="search-filters">
                  <button type="button" className="filter-btn">📐 Size</button>
                  <button type="button" className="filter-btn">💰 Budget</button>
                </div>
                <Link href="/search" className="search-go">Search ✦</Link>
              </div>
              <div className="search-suggestions">
                <span className="suggest-label">Trending:</span>
                <span className="suggest-chip">🔥 Gurgaon Sector 65</span>
                <span className="suggest-chip">📈 Noida Expressway</span>
                <span className="suggest-chip">🌟 Baner, Pune</span>
                <span className="suggest-chip">🏙️ Whitefield, Bangalore</span>
                <span className="suggest-chip">✨ BKC Mumbai</span>
                <span className="trend-badge">↑ 18% price jump in Hyderabad</span>
              </div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">2.4<span className="unit">M+</span></div>
              <div className="stat-label">Active Listings</div>
              <div className="stat-delta">↑ 12% this month</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">1.2<span className="unit">L+</span></div>
              <div className="stat-label">Happy Families</div>
              <div className="stat-delta">↑ 8% this month</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">340<span className="unit">+</span></div>
              <div className="stat-label">Indian Cities</div>
              <div className="stat-delta">Tier 1, 2 & 3</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">₹18<span className="unit">K</span></div>
              <div className="stat-label">Avg. Savings</div>
              <div className="stat-delta">Per transaction</div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="trust-item"><div className="trust-icon">✅</div> RERA Verified Listings</div>
        <div className="trust-divider" />
        <div className="trust-item"><div className="trust-icon">🔒</div> Zero Spam Guarantee</div>
        <div className="trust-divider" />
        <div className="trust-item"><div className="trust-icon">🤖</div> AI Price Validation</div>
        <div className="trust-divider" />
        <div className="trust-item"><div className="trust-icon">📋</div> Legal Doc Checker</div>
        <div className="trust-divider" />
        <div className="trust-item"><div className="trust-icon">🇮🇳</div> Made for India</div>
      </div>

      <section className="city-section reveal">
        <div className="sec-eyebrow">Explore by City</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h2 className="sec-title">India&apos;s Hottest<br />Real Estate <em>Markets</em></h2>
          <Link href="/search" className="view-all-link">All 340+ cities →</Link>
        </div>
        <div className="cities-row">
          {CITIES.map((c) => (
            <div key={c.name} className="city-card reveal">
              <div className="city-img">
                {DEMO_IMAGES.cities[c.name as keyof typeof DEMO_IMAGES.cities] ? (
                  <Image
                    src={DEMO_IMAGES.cities[c.name as keyof typeof DEMO_IMAGES.cities]}
                    alt={c.name}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <span style={{ fontSize: 52, position: "relative", zIndex: 1 }}>{c.emoji}</span>
                )}
                <div className="city-overlay" />
              </div>
              <div className="city-info">
                <div className="city-name">{c.name}</div>
                <div className="city-count">{c.count}</div>
                <div className="city-trend">{c.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section listings-section">
        <div className="listings-header reveal">
          <div>
            <div className="sec-eyebrow">AI-Curated For You</div>
            <h2 className="sec-title">Properties You&apos;ll <em>Love</em></h2>
          </div>
          <Link href="/search" className="view-all-link">View all 2.4M+ listings →</Link>
        </div>
        <div className="listings-grid">
          <Link href="/property/detail" className="l-card featured reveal">
            <div className="l-img">
              <PropertyImage
                src={DEMO_IMAGES.properties["sobha-city-vista"].cover}
                alt="Sobha City Vista — 4 BHK Ultra Luxury"
                className="l-img-bg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="l-img-gradient" />
              <div className="l-badges">
                <span className="lb lb-premium">⭐ PREMIUM</span>
                <span className="lb lb-ai">✦ AI PICK</span>
              </div>
              <button type="button" className="l-heart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHeart(0); }} aria-label="Save">{hearts[0] ? "❤️" : "♡"}</button>
              <div className="l-score" style={{ bottom: 72 }}>
                <div className="l-score-num">94</div>
                <div className="l-score-label">AI Score</div>
              </div>
            </div>
            <div className="l-body">
              <div className="l-price">₹2.85 Cr <span className="l-unit">onwards</span></div>
              <div className="l-name">Sobha City Vista — 4 BHK Ultra Luxury Apartment, Gurgaon</div>
              <div className="l-loc">📍 Sector 108, Gurgaon · 2,850 sq.ft · Ready to Move</div>
              <div className="l-specs">
                <span className="l-spec">🛏 4 BHK</span>
                <span className="l-spec">🚿 4 Bath</span>
                <span className="l-spec">🚗 2 Park</span>
                <span className="l-spec">📐 2,850 sqft</span>
                <span className="l-spec">✅ RERA</span>
              </div>
              <div className="l-ai-box"><strong>✦ AI Insight:</strong> 18% price appreciation expected in 24 months. Metro 1.2km. 94/100 Livability. Priced 8% below market.</div>
            </div>
          </Link>
          <Link href="/property/detail" className="l-card reveal">
            <div className="l-img">
              <PropertyImage
                src={DEMO_IMAGES.properties["dlf-mypad"].cover}
                alt="DLF MyPad — 2 BHK Studio, Noida"
                className="l-img-bg"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="l-img-gradient" />
              <div className="l-badges">
                <span className="lb lb-verified">✓ Verified</span>
                <span className="lb lb-hot">🔥 Hot</span>
              </div>
              <button type="button" className="l-heart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHeart(1); }} aria-label="Save">{hearts[1] ? "❤️" : "♡"}</button>
              <div className="l-score">
                <div className="l-score-num">88</div>
                <div className="l-score-label">AI Score</div>
              </div>
            </div>
            <div className="l-body">
              <div className="l-price">₹78 L <span className="l-unit">onwards</span></div>
              <div className="l-name">DLF MyPad — 2 BHK Studio Apartments, Noida</div>
              <div className="l-loc">📍 Sector 59, Noida · 1,100 sq.ft</div>
              <div className="l-specs">
                <span className="l-spec">🛏 2 BHK</span>
                <span className="l-spec">🚿 2 Bath</span>
                <span className="l-spec">📐 1,100 sqft</span>
              </div>
              <div className="l-ai-box"><strong>✦ AI:</strong> Best value in locality. 92% of similar seekers shortlisted this.</div>
            </div>
          </Link>
          <Link href="/property/detail" className="l-card reveal">
            <div className="l-img">
              <PropertyImage
                src={DEMO_IMAGES.properties["m3m-golf-hills"].cover}
                alt="M3M Golf Hills — 3 BHK Premium"
                className="l-img-bg"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="l-img-gradient" />
              <div className="l-badges">
                <span className="lb lb-new">NEW</span>
                <span className="lb lb-ai">✦ AI PICK</span>
              </div>
              <button type="button" className="l-heart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHeart(2); }} aria-label="Save">{hearts[2] ? "❤️" : "♡"}</button>
              <div className="l-score">
                <div className="l-score-num">91</div>
                <div className="l-score-label">AI Score</div>
              </div>
            </div>
            <div className="l-body">
              <div className="l-price">₹1.45 Cr <span className="l-unit">onwards</span></div>
              <div className="l-name">M3M Golf Hills — 3 BHK Premium Floors, Gurgaon</div>
              <div className="l-loc">📍 Sector 79, Gurgaon · 1,890 sq.ft</div>
              <div className="l-specs">
                <span className="l-spec">🛏 3 BHK</span>
                <span className="l-spec">🚿 3 Bath</span>
                <span className="l-spec">📐 1,890 sqft</span>
              </div>
              <div className="l-ai-box"><strong>✦ AI:</strong> 37 people viewed today. Price rising after DDJK highway opens Q2 2025.</div>
            </div>
          </Link>
        </div>
      </section>

      <section className="score-panel">
        <div className="reveal">
          <div className="sec-eyebrow">AI Property Score</div>
          <h2 className="sec-title">Know <em>Exactly</em><br />What You&apos;re<br />Buying</h2>
          <p className="sec-sub">Every property on UrbanNest.ai gets a comprehensive AI analysis across 14 dimensions — so you can make data-driven decisions with complete confidence.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
            {["Livability, safety, appreciation potential scored", "Legal clarity & RERA compliance checked", "Neighbourhood quality, schools, hospitals mapped", "Fair market price validated against 10M+ data points"].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--teal)", fontSize: 18 }}>✦</span> {text}
              </div>
            ))}
          </div>
          <Link href="/search" className="btn-nav-primary" style={{ marginTop: 32, padding: "14px 28px", fontSize: 15, borderRadius: 14 }}>See Score for Any Property</Link>
        </div>
        <div className="score-visual reveal">
          <div className="score-property-thumb-wrap">
            <Image src={DEMO_IMAGES.properties["prestige-sunrise-park"].cover} alt="Prestige Sunrise Park" fill className="score-property-thumb" sizes="280px" />
          </div>
          <div className="score-property-name">
            <span>Prestige Sunrise Park, Whitefield</span>
            <span style={{ background: "var(--teal-dim)", border: "1px solid rgba(0,212,170,0.3)", padding: "5px 14px", borderRadius: "100px", fontSize: 13, color: "var(--teal)" }}>Excellent</span>
          </div>
          <div className="overall-score">
            <div className="big-score">94</div>
            <div className="score-desc">
              <strong>AI Score: Excellent</strong>
              This property scores in the top 6% of all listings in Whitefield. Strong investment with high appreciation potential.
            </div>
          </div>
          <div className="score-bars">
            {[
              { label: "Livability", w: 92, orange: false },
              { label: "Price Fairness", w: 88, orange: false },
              { label: "Appreciation", w: 96, orange: false },
              { label: "Connectivity", w: 78, orange: true },
              { label: "Legal Clarity", w: 100, orange: false },
              { label: "Safety", w: 85, orange: false },
              { label: "School Access", w: 72, orange: true },
            ].map((r) => (
              <div key={r.label} className="score-row">
                <span className="score-row-label">{r.label}</span>
                <div className="score-bar-bg"><div className={`score-bar-fill ${r.orange ? "orange" : ""}`} style={{ width: `${r.w}%` }} /></div>
                <span className="score-val">{r.w === 100 ? "✓" : r.w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-features-section">
        <div className="reveal">
          <div className="sec-eyebrow">Why UrbanNest.ai</div>
          <h2 className="sec-title">AI That <em>Actually</em><br />Works For You</h2>
          <p className="sec-sub">We&apos;ve rebuilt real estate from first principles — every feature is designed around how people actually search, decide and buy homes in India.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: "🧠", title: "Conversational AI Search", desc: "Type exactly what you want in plain language. \"3BHK near good school, walkable to metro, quiet neighbourhood under ₹90L in Pune.\" We understand you — not just keywords.", badge: "✦ GPT-4 Powered", cls: "feat-icon-teal" },
            { icon: "📊", title: "Price Intelligence", desc: "Know instantly if a property is overpriced, undervalued, or fairly priced. Backed by ₹2.4 trillion in verified transaction data across 340 Indian cities.", badge: "✦ 10M+ Data Points", cls: "feat-icon-coral" },
            { icon: "🗺️", title: "Neighbourhood AI", desc: "Score any locality on safety, commute, schools, hospitals, nightlife, green cover, noise levels and more. Make informed decisions — not gambles.", badge: "✦ 40+ Signals", cls: "feat-icon-gold" },
            { icon: "🔮", title: "Price Forecasting", desc: "ML model predicts 12–36 month appreciation based on infra projects, RERA data, demand trends, migration patterns and macro-economic signals.", badge: "✦ 89% Accuracy", cls: "feat-icon-teal" },
            { icon: "🤝", title: "AI Negotiation Coach", desc: "Know the exact right price to offer. Our AI analyzes comparable recent sales, time on market, and seller motivation to give you the optimal bid strategy.", badge: "✦ Avg. ₹18K Savings", cls: "feat-icon-coral" },
            { icon: "📋", title: "Legal Shield", desc: "Instant RERA compliance check, title clarity score, encumbrance report, and full document checklist. Know every legal risk before you sign anything.", badge: "✦ 100% RERA Checked", cls: "feat-icon-gold" },
          ].map((f) => (
            <div key={f.title} className="feat-card reveal">
              <div className={`feat-icon-wrap ${f.cls}`}>{f.icon}</div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
              <span className="feat-badge">{f.badge}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="map-section">
        <div className="map-card reveal">
          <div className="map-grid-bg" />
          <svg className="map-roads" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path d="M0 200 Q100 180 200 200 Q300 220 400 200" stroke="rgba(0,212,170,0.4)" strokeWidth="2" />
            <path d="M200 0 Q180 100 200 200 Q220 300 200 400" stroke="rgba(0,212,170,0.4)" strokeWidth="2" />
          </svg>
          <div className="map-pulse" style={{ top: "28%", left: "35%" }}><div className="map-pulse-inner" /></div>
          <div className="map-pulse coral" style={{ top: "55%", left: "60%" }}><div className="map-pulse-inner" /></div>
          <div className="map-pulse gold" style={{ top: "42%", left: "20%" }}><div className="map-pulse-inner" /></div>
          <div className="map-pulse" style={{ top: "72%", left: "45%" }}><div className="map-pulse-inner" /></div>
          <div className="price-tag" style={{ top: "14%", left: "38%" }}>
            <div className="price-tag-price">₹1.2 Cr</div>
            <div className="price-tag-name">Sector 49, Gurgaon</div>
            <div className="price-tag-trend">↑ 18% appreciation</div>
          </div>
          <div className="price-tag" style={{ top: "34%", left: "62%" }}>
            <div className="price-tag-price">₹85L</div>
            <div className="price-tag-name">Noida Sector 137</div>
            <div className="price-tag-trend">↑ 12% appreciation</div>
          </div>
          <div className="map-legend">
            <div className="map-legend-title">AI Demand Heatmap</div>
            <div className="legend-grad" />
            <div className="legend-labels"><span>Low</span><span>Medium</span><span>High</span><span>Surge</span></div>
          </div>
        </div>
        <div className="map-content-area reveal">
          <div className="sec-eyebrow">AI Heatmaps</div>
          <h2 className="sec-title">Explore India<br />Like Never <em>Before</em></h2>
          <p className="sec-sub">AI overlays demand trends, price history, future infrastructure and livability data directly on the map. See the full picture — not just pins on a blank map.</p>
          <div className="map-feature-list">
            <div className="map-feat">
              <div className="map-feat-icon" style={{ background: "var(--teal-dim)", border: "1px solid rgba(0,212,170,0.2)" }}>🏗️</div>
              <div>
                <div className="map-feat-title">Infrastructure Intelligence</div>
                <div className="map-feat-desc">See planned metro lines, highways, schools and hospitals before they&apos;re built — invest ahead of the curve.</div>
              </div>
            </div>
            <div className="map-feat">
              <div className="map-feat-icon" style={{ background: "var(--coral-dim)", border: "1px solid rgba(255,107,74,0.2)" }}>🌡️</div>
              <div>
                <div className="map-feat-title">Live Demand Heatmaps</div>
                <div className="map-feat-desc">Which localities are trending? Where is demand surging right now? Updated every 6 hours.</div>
              </div>
            </div>
            <div className="map-feat">
              <div className="map-feat-icon" style={{ background: "var(--gold-dim)", border: "1px solid rgba(245,200,66,0.2)" }}>📈</div>
              <div>
                <div className="map-feat-title">10-Year Price History</div>
                <div className="map-feat-desc">Visualize price movement at street-level granularity. Understand trends before committing.</div>
              </div>
            </div>
          </div>
          <Link href="/search" className="btn-nav-primary" style={{ marginTop: 28, padding: "14px 28px", fontSize: 15, borderRadius: 14 }}>Explore the AI Map →</Link>
        </div>
      </section>

      <div className="metrics-section">
        {[
          { num: "2.4", unit: "M", label: "Active Listings", sub: "Growing 12% monthly" },
          { num: "₹18", unit: "K", sup: true, label: "Average Savings per Deal", sub: "Via AI Price Intelligence" },
          { num: "340", unit: "+", label: "Cities Covered", sub: "Tier 1, 2 & 3 India" },
          { num: "4.9", unit: "★", label: "App Store Rating", sub: "1.2L+ reviews" },
        ].map((m) => (
          <div key={m.label} className="metric-item reveal">
            <div className="metric-num">{m.num}{m.sup ? <sup>{m.unit}</sup> : <span className="plus">{m.unit}</span>}</div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <section className="testimonials-section">
        <div className="reveal">
          <div className="sec-eyebrow">Real Stories</div>
          <h2 className="sec-title">They Found Their<br />Home with <em>UrbanNest.ai</em></h2>
        </div>
        <div className="testi-grid">
          {[
            { quote: "\"The AI search is genuinely magical. I typed a paragraph describing my dream home and it showed me exactly what I wanted. Bought in 3 weeks.\"", savings: "💰 Saved ₹14 lakhs via AI Price Check", name: "Priya Sharma", detail: "Bought 3BHK in Sector 62, Noida · ₹1.1 Cr", avatarIndex: 0 },
            { quote: "\"The Price Intelligence feature saved me ₹8 lakhs. It told me the asking price was 12% above market — I negotiated down and got the deal.\"", savings: "💰 Saved ₹8 lakhs via Negotiation Coach", name: "Arjun Mehta", detail: "Bought 2BHK in Baner, Pune · ₹76 L", avatarIndex: 1 },
            { quote: "\"As a first-time buyer moving from Delhi to Bangalore, UrbanNest's neighbourhood AI scores helped me pick the perfect locality risk-free.\"", savings: "🏠 Found ideal home in 11 days", name: "Ananya Singh", detail: "Rented in Koramangala, Bangalore · ₹38K/mo", avatarIndex: 2 },
          ].map((t) => (
            <div key={t.name} className="testi-card reveal">
              <div className="testi-stars">{[1,2,3,4,5].map((i) => <span key={i} className="star">★</span>)}</div>
              <p className="testi-quote">{t.quote}</p>
              <div className="testi-savings">{t.savings}</div>
              <div className="testi-author">
                <div className="testi-avatar">
                  <Image src={DEMO_IMAGES.testimonials[t.avatarIndex]} alt="" width={42} height={42} className="testi-avatar-img" />
                </div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-detail">{t.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="app-section">
        <div className="app-mockup reveal">
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-bar teal" />
              <div className="phone-bar short" />
              <div style={{ height: 8 }} />
              <div className="phone-card-mini">
                <div className="phone-card-img">
                  <Image src={DEMO_IMAGES.properties["sobha-city-vista"].cover} alt="" width={32} height={32} className="phone-card-thumb" />
                </div>
                <div className="phone-mini-bars"><div className="phone-mini-bar w80" /><div className="phone-mini-bar w60" /></div>
              </div>
              <div className="phone-card-mini">
                <div className="phone-card-img">
                  <Image src={DEMO_IMAGES.properties["dlf-mypad"].cover} alt="" width={32} height={32} className="phone-card-thumb" />
                </div>
                <div className="phone-mini-bars"><div className="phone-mini-bar w80" /><div className="phone-mini-bar w60" /></div>
              </div>
              <div className="phone-bar med" />
              <div className="phone-bar short" />
            </div>
          </div>
          <div className="phone-frame big">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-bar teal" style={{ width: "50%", margin: "0 auto 4px" }} />
              <div className="phone-hero-img-wrap">
                <Image src={DEMO_IMAGES.cities.Bangalore} alt="" fill className="phone-hero-img" sizes="200px" />
              </div>
              <div className="phone-bar med" />
              <div className="phone-bar short" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, flex: 1 }}>
                <div className="phone-feat-cell" style={{ background: "var(--teal-dim)", border: "1px solid rgba(0,212,170,0.2)" }}>
                  <Image src={DEMO_IMAGES.properties["prestige-sunrise-park"].cover} alt="" fill className="phone-feat-img" sizes="80px" />
                </div>
                <div className="phone-feat-cell" style={{ background: "var(--coral-dim)", border: "1px solid rgba(255,107,74,0.2)" }}>
                  <Image src={DEMO_IMAGES.properties["m3m-golf-hills"].cover} alt="" fill className="phone-feat-img" sizes="80px" />
                </div>
                <div className="phone-feat-cell" style={{ background: "var(--gold-dim)", border: "1px solid rgba(245,200,66,0.2)" }}>
                  <Image src={DEMO_IMAGES.cities["Delhi NCR"]} alt="" fill className="phone-feat-img" sizes="80px" />
                </div>
                <div className="phone-feat-cell" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}>
                  <Image src={DEMO_IMAGES.properties["godrej-meridian"].cover} alt="" fill className="phone-feat-img" sizes="80px" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="app-cta reveal">
          <div className="sec-eyebrow">Mobile App</div>
          <h2 className="sec-title">Your Pocket<br /><em>Real Estate</em><br />Advisor</h2>
          <p className="sec-sub" style={{ marginTop: 14 }}>All of UrbanNest.ai&apos;s power in your palm. Search, save, compare and consult your AI Copilot anytime, anywhere.</p>
          <div className="app-features">
            {["Instant AI property scoring on the go", "Price alerts for saved localities", "Virtual tours & 3D walkthroughs", "Offline neighbourhood maps", "Push alerts when new listings match"].map((f) => (
              <div key={f} className="app-feat">{f}</div>
            ))}
          </div>
          <div className="store-buttons">
            <a href="#" className="store-btn"><span className="store-icon">🍎</span><div className="store-text"><div className="store-small">Download on the</div><div className="store-name">App Store</div></div></a>
            <a href="#" className="store-btn"><span className="store-icon">▶️</span><div className="store-text"><div className="store-small">Get it on</div><div className="store-name">Google Play</div></div></a>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="sec-eyebrow">Get Started Today</div>
        <h2>Your Dream Home<br />is One <em>Smart Search</em> Away</h2>
        <p>Join 1.2 lakh+ families who found their perfect property with UrbanNest.ai. Free forever — no hidden charges.</p>
        <div className="cta-btns">
          <Link href="/search" className="btn-cta-primary">Start Your AI Search — Free →</Link>
          <Link href="/post-property" className="btn-cta-outline">Post Property Free</Link>
        </div>
      </section>
    </>
  );
}
