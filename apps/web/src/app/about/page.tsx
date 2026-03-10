/**
 * @file page.tsx
 * @module app/about
 * @description About Us & Investors page
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Investors — UrbanNest.ai",
  description: "We're rebuilding India's real estate experience with AI, trust, and radical transparency.",
};

export default function AboutPage() {
  return (
    <div className="page-wrap">
      <div className="about-hero">
        <div className="hero-glow" />
        <div className="about-hero-content">
          <span className="badge badge-teal" style={{ marginBottom: 20 }}>DPIIT Recognised Startup · Est. 2024</span>
          <h1 className="h1" style={{ marginBottom: 20 }}>We&apos;re Rebuilding India&apos;s<br />Real Estate Experience <em className="teal">From Scratch</em></h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.65, fontWeight: 300, maxWidth: 560 }}>The ₹30 trillion Indian real estate market is broken — opaque pricing, fake listings, zero transparency. We&apos;re fixing it with AI, trust, and radical transparency.</p>
          <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
            <button type="button" className="btn-primary lg">Join the Mission</button>
            <button type="button" className="btn-outline lg">Investor Deck →</button>
          </div>
        </div>
      </div>

      <section className="mission-section">
        <div className="reveal">
          <div className="eyebrow">Our Mission</div>
          <h2 className="h2">Make Every Indian a Confident Homebuyer</h2>
          <p className="sub">For too long, buying a home in India has meant navigating fake prices, suspicious agents, and mountains of paperwork. UrbanNest.ai gives every Indian — whether they&apos;re a first-time buyer or a seasoned investor — the same information advantage that insiders have always had.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
            {[
              { title: "Radical Transparency", text: "Every listing shows price history, fair market value and red flags." },
              { title: "AI That Actually Works", text: "Not just keyword search. Conversational AI that understands what you want." },
              { title: "Zero Fake Listings", text: "100% RERA-verified. Every listing manually or AI-reviewed before going live." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--teal)", fontSize: 18, marginTop: -2 }}>✦</span>
                <span><strong style={{ color: "var(--white)" }}>{item.title}</strong> — {item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mission-visual reveal">
          <div className="mission-quote">Real estate is the largest purchase most Indians will ever make. They deserve perfect information — not guesswork and spam calls.</div>
          <div className="mission-author">
            <div className="mission-avatar">👨</div>
            <div><div className="mission-name">Rahul Agarwal</div><div className="mission-role">Co-Founder & CEO, UrbanNest.ai</div></div>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 52px 80px" }}>
        <div className="impact-grid reveal">
          <div className="impact-item"><div className="impact-num">2.4M</div><div className="impact-label">Active Listings</div><div className="impact-sub">Growing 12% monthly</div></div>
          <div className="impact-item"><div className="impact-num">1.2L</div><div className="impact-label">Families Helped</div><div className="impact-sub">Since launch 2024</div></div>
          <div className="impact-item"><div className="impact-num">₹340Cr</div><div className="impact-label">Total Deal Value</div><div className="impact-sub">Transacted via platform</div></div>
          <div className="impact-item"><div className="impact-num">₹18K</div><div className="impact-label">Avg. Savings</div><div className="impact-sub">Per buyer via AI pricing</div></div>
        </div>
      </div>

      <section className="section" style={{ background: "var(--dark)" }}>
        <div className="eyebrow">The Team</div>
        <h2 className="h2">Built by People Who&apos;ve<br /><em className="teal">Lived the Problem</em></h2>
        <div className="team-grid">
          {[
            { name: "Rahul Agarwal", role: "Co-Founder & CEO", prev: "Ex-Zillow, IIT Delhi · 12 yrs PropTech", avatar: "👨‍💼", bg: "linear-gradient(135deg,rgba(0,212,170,0.2),rgba(0,168,132,0.1))" },
            { name: "Priya Menon", role: "Co-Founder & CTO", prev: "Ex-Google AI, IIT Bombay · ML Expert", avatar: "👩‍💻", bg: "linear-gradient(135deg,rgba(255,107,74,0.2),rgba(255,80,50,0.1))" },
            { name: "Arjun Khanna", role: "VP — Product", prev: "Ex-NoBroker, ISB Hyderabad", avatar: "👨‍🔬", bg: "linear-gradient(135deg,rgba(245,200,66,0.2),rgba(220,175,40,0.1))" },
            { name: "Kavya Reddy", role: "VP — Growth", prev: "Ex-Housing.com, IIM Ahmedabad", avatar: "👩‍💼", bg: "linear-gradient(135deg,rgba(74,222,128,0.2),rgba(50,200,100,0.1))" },
          ].map((t) => (
            <div key={t.name} className="team-card reveal">
              <div className="team-avatar" style={{ background: t.bg }}>{t.avatar}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
              <div className="team-prev">{t.prev}</div>
              <div className="team-social"><div className="ts">in</div><div className="ts">𝕏</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="investors" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "start" }}>
        <div className="reveal">
          <div className="eyebrow">Funding Journey</div>
          <h2 className="h2" style={{ marginBottom: 36 }}>Our <em className="teal">Growth Story</em></h2>
          <div className="timeline">
            {[
              { date: "Jan 2024 · Founding", title: "UrbanNest.ai Founded", desc: "3 co-founders quit big tech to solve India's broken real estate market.", amount: null },
              { date: "Apr 2024 · Pre-Seed", title: "Pre-Seed Round Closed", desc: "Raised from angels, ex-founders, and YC alumni.", amount: "💰 ₹2.5 Cr" },
              { date: "Oct 2024 · Seed", title: "Seed Round — Surge by Sequoia", desc: "Selected for Surge Cohort 10. Platform launched publicly with 1L listings.", amount: "💰 ₹12 Cr" },
              { date: "Mar 2025 · Milestone", title: "1 Lakh Families Served", desc: "Crossed 2.4M listings across 340 cities. Revenue: ₹1.8 Cr MRR.", amount: null },
              { date: "Q3 2025 · Series A", title: "Series A — Open for Investment", desc: "Raising to accelerate AI capabilities, expand to 1000+ cities and launch enterprise builder SaaS.", amount: "🎯 Target: ₹80 Cr", future: true },
            ].map((tl) => (
              <div key={tl.date} className="tl-item">
                <div className={`tl-dot ${tl.future ? "future" : ""}`} />
                <div className="tl-date">{tl.date}</div>
                <div className="tl-title">{tl.title}</div>
                <div className="tl-desc">{tl.desc}</div>
                {tl.amount && <div className="tl-amount" style={tl.future ? { background: "var(--gold-dim)", borderColor: "rgba(245,200,66,0.3)", color: "var(--gold)" } : undefined}>{tl.amount}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="reveal">
          <div className="eyebrow">Backed By</div>
          <h2 className="h2" style={{ marginBottom: 28 }}>World-Class <em className="teal">Investors</em></h2>
          <div className="investor-grid">
            {[
              { logo: "🌊", name: "Surge by Sequoia", type: "Lead Seed Investor" },
              { logo: "💡", name: "Lightspeed India", type: "Strategic Partner" },
              { logo: "🚀", name: "YC Alumni Syndicate", type: "Angel Network" },
              { logo: "🏗️", name: "PropTech Ventures", type: "Sector-focused VC" },
              { logo: "🇮🇳", name: "SIDBI Ventures", type: "Govt. Backed Fund" },
              { logo: "👨‍💼", name: "Angel Investors", type: "12 ex-founders" },
            ].map((inv) => (
              <div key={inv.name} className="inv-card">
                <div className="inv-logo">{inv.logo}</div>
                <div><div className="inv-name">{inv.name}</div><div className="inv-type">{inv.type}</div></div>
              </div>
            ))}
          </div>
          <div className="investor-cta" style={{ marginTop: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div className="h3" style={{ marginBottom: 8 }}>Invest in the Future of<br />Indian Real Estate</div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "10px 0 24px", lineHeight: 1.6 }}>We&apos;re raising our Series A. If you&apos;re a fund or strategic investor who believes AI will transform India&apos;s ₹30T real estate market, let&apos;s talk.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn-primary">Request Investor Deck</button>
              <button type="button" className="btn-outline">Schedule a Call</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--dark)" }}>
        <div className="eyebrow">Press & Media</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>UrbanNest.ai <em className="teal">in the News</em></h2>
        <div className="press-grid">
          {[
            { logo: "Economic Times", headline: "\"The AI startup that's making buying a home in India less terrifying\"", date: "February 2025" },
            { logo: "YourStory", headline: "\"UrbanNest.ai raises ₹12Cr Seed, aims to bring AI transparency to India's opaque property market\"", date: "November 2024" },
            { logo: "Inc42", headline: "\"How UrbanNest.ai is using GPT-4 to give every Indian buyer institutional-grade data\"", date: "January 2025" },
          ].map((p) => (
            <div key={p.logo} className="press-card reveal">
              <div className="press-logo">{p.logo}</div>
              <div className="press-headline">{p.headline}</div>
              <div className="press-date">{p.date}</div>
              <a href="#" className="press-link">Read article →</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
