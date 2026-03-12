/**
 * @file page.tsx
 * @module app/post-property
 * @description Post property free — listing form and pricing
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PostPropertyForm from "@/components/post-property/PostPropertyForm";
import PostPropertyAICta from "@/components/post-property/PostPropertyAICta";
import { DEMO_IMAGES } from "@/lib/demo-images";

export const metadata: Metadata = {
  title: "Post Property Free — UrbanNest.ai",
  description: "Post your property. Reach millions of verified buyers. 100% free for owners.",
};

export default function PostPropertyPage() {
  return (
    <div className="page-wrap">
      <div className="post-hero">
        <div className="post-hero-content">
          <span className="badge badge-teal" style={{ marginBottom: 16 }}>✦ 100% Free for Owners</span>
          <h1 className="h1" style={{ marginBottom: 16 }}>Post Your Property.<br /><em className="teal">Reach Millions.</em></h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.65, fontWeight: 300, maxWidth: 500, marginBottom: 32 }}>2.4 million active buyers on UrbanNest.ai. Verified leads. AI-matched to your property. Zero spam.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="#post-form"><button type="button" className="btn-primary lg">Post Property Free →</button></Link>
            <button type="button" className="btn-outline lg" style={{ padding: "15px 28px" }}>View Pricing Plans</button>
          </div>
        </div>
        <div className="post-hero-img-wrap">
          <Image src={DEMO_IMAGES.properties["brigade-cornerstone-utopia"].cover} alt="" fill className="post-hero-img-img" sizes="320px" />
        </div>
      </div>

      <div className="benefits-strip">
        <div className="bs-item"><div className="bs-icon">👥</div><div className="bs-val">2.4M+</div><div className="bs-label">Active Buyers Monthly</div></div>
        <div className="bs-item"><div className="bs-icon">⚡</div><div className="bs-val">4 hrs</div><div className="bs-label">Avg. First Lead Time</div></div>
        <div className="bs-item"><div className="bs-icon">✅</div><div className="bs-val">98%</div><div className="bs-label">Lead Quality Score</div></div>
        <div className="bs-item"><div className="bs-icon">🏙️</div><div className="bs-val">340+</div><div className="bs-label">Cities Covered</div></div>
      </div>

      <section className="section">
        <div style={{ textAlign: "center" }}><div className="eyebrow" style={{ justifyContent: "center" }}>How It Works</div><h2 className="h2">Listed in 4 Simple Steps</h2></div>
        <div className="steps-row reveal">
          {[
            { n: 1, title: "Create Listing", desc: "Add property details, photos and price. Takes 5 minutes." },
            { n: 2, title: "AI Enhancement", desc: "Our AI auto-improves your listing with market data and scores." },
            { n: 3, title: "Get Matched", desc: "AI matches your property to qualified buyers instantly." },
            { n: 4, title: "Close the Deal", desc: "Receive verified enquiries and close faster. Average: 18 days." },
          ].map((s) => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: "var(--dark)", paddingTop: 60, paddingBottom: 80 }}>
        <div style={{ textAlign: "center" }}><div className="eyebrow" style={{ justifyContent: "center" }}>Pricing</div><h2 className="h2">Choose Your Plan</h2><p className="sub" style={{ margin: "10px auto 0", textAlign: "center" }}>Owners post free. Builders and agents get power tools.</p></div>
        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="plan-name">Free</div>
            <div className="plan-price">₹0 <span>/listing</span></div>
            <div className="plan-period">Forever free for individual owners</div>
            <ul className="plan-features">
              <li>1 active listing</li>
              <li>Basic property details</li>
              <li>10 photos upload</li>
              <li className="muted">AI listing enhancement</li>
            </ul>
            <button type="button" className="btn-outline" style={{ width: "100%", padding: 13, borderRadius: 12 }}>Get Started Free</button>
          </div>
          <div className="price-card featured reveal">
            <div className="price-badge">✦ Most Popular</div>
            <div className="plan-name">Professional</div>
            <div className="plan-price">₹999 <span>/mo</span></div>
            <div className="plan-period">Per project · Billed monthly</div>
            <ul className="plan-features">
              <li>10 active listings</li>
              <li>AI listing enhancement</li>
              <li>30 photos + 1 video</li>
              <li>Priority placement</li>
              <li>Lead analytics dashboard</li>
            </ul>
            <button type="button" className="btn-primary" style={{ width: "100%", padding: 13, borderRadius: 12 }}>Start Free Trial</button>
          </div>
          <div className="price-card reveal">
            <div className="plan-name">Builder Pro</div>
            <div className="plan-price">₹4,999 <span>/mo</span></div>
            <div className="plan-period">For developers & large agents</div>
            <ul className="plan-features">
              <li>Unlimited listings</li>
              <li>AI-powered lead scoring</li>
              <li>Virtual tour embed</li>
              <li>Dedicated account manager</li>
            </ul>
            <button type="button" className="btn-outline" style={{ width: "100%", padding: 13, borderRadius: 12 }}>Contact Sales</button>
          </div>
        </div>
      </section>

      <section className="section" id="post-form">
        <div style={{ textAlign: "center", marginBottom: 48 }}><div className="eyebrow" style={{ justifyContent: "center" }}>Post Now</div><h2 className="h2">Create Your Listing</h2></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 32, padding: "20px 24px", background: "var(--dark-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <PostPropertyAICta />
        </div>
        <div className="form-wrap">
          <PostPropertyForm />
        </div>
      </section>
    </div>
  );
}
