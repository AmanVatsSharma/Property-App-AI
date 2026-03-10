/**
 * @file page.tsx
 * @module app/property/detail
 * @description Property detail page
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobha City Vista — Property Detail — UrbanNest.ai",
  description: "4 BHK Ultra Luxury Apartment, Sector 108, Gurgaon",
};

export default function PropertyDetailPage() {
  return (
    <div className="page-wrap">
      <div style={{ padding: "20px 52px 0", background: "var(--dark)", borderBottom: "1px solid var(--border)" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/search">Buy in Gurgaon</Link><span>/</span>
          <Link href="/search">Sector 108</Link><span>/</span>
          <span style={{ color: "var(--text-muted)" }}>Sobha City Vista</span>
        </div>
        <div className="gallery">
          <div className="gallery-main">
            🏡
            <div className="gallery-actions">
              <button type="button" className="gal-btn">📸 All Photos (24)</button>
              <button type="button" className="gal-btn">🎬 Video Tour</button>
            </div>
          </div>
          <div className="gallery-sub" style={{ background: "linear-gradient(135deg,#1a3020,#243a2a)" }}>🌿</div>
          <div className="gallery-sub" style={{ background: "linear-gradient(135deg,#1a2030,#242a40)" }}>🏊</div>
        </div>
      </div>
      <div className="detail-layout">
        <div>
          <div className="prop-header">
            <div className="prop-title-row">
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span className="badge badge-gold">⭐ Premium</span>
                  <span className="badge badge-teal">✦ AI Pick</span>
                  <span className="badge badge-green">✓ RERA Verified</span>
                </div>
                <div className="prop-main-title">Sobha City Vista — 4 BHK Ultra Luxury Apartment</div>
                <div className="prop-address">📍 Sector 108, Dwarka Expressway, Gurgaon, Haryana 122017</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="prop-price-big">₹2.85 Cr</div>
                <span className="prop-price-per">₹10,000 / sq.ft</span>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-ghost-sm">♡ Save</button>
                  <button type="button" className="btn-ghost-sm">⤴ Share</button>
                </div>
              </div>
            </div>
            <div className="prop-quick-specs">
              {[
                { icon: "🛏", val: "4 BHK", label: "Bedrooms" },
                { icon: "🚿", val: "4", label: "Bathrooms" },
                { icon: "📐", val: "2,850", label: "Sq.ft" },
                { icon: "🚗", val: "2", label: "Parking" },
                { icon: "🏢", val: "14th", label: "Floor" },
                { icon: "📅", val: "Ready", label: "Status" },
              ].map((q) => (
                <div key={q.label} className="qs-item">
                  <div className="qs-icon">{q.icon}</div>
                  <div className="qs-val">{q.val}</div>
                  <div className="qs-label">{q.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-tabs">
            <div className="dtab active">Overview</div>
            <div className="dtab">Amenities</div>
            <div className="dtab">Price History</div>
            <div className="dtab">Neighbourhood</div>
          </div>
          <div className="overview-grid">
            {[
              { label: "Project", val: "Sobha City Vista" },
              { label: "Builder", val: "Sobha Ltd." },
              { label: "Possession", val: "Ready to Move" },
              { label: "Total Floors", val: "G + 32" },
              { label: "Facing", val: "East Facing" },
              { label: "RERA No.", val: "HRERA-PKL-NOV-...", green: true },
            ].map((o) => (
              <div key={o.label} className="ov-item">
                <div className="ov-label">{o.label}</div>
                <div className="ov-val" style={o.green ? { color: "var(--green)" } : undefined}>{o.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-sidebar">
          <div className="contact-card">
            <h4>Contact Owner</h4>
            <p>Get in touch for site visits and negotiations</p>
            <button type="button" className="call-btn" style={{ width: "100%", marginBottom: 8 }}>📞 Call Now</button>
            <button type="button" className="whatsapp-btn" style={{ width: "100%" }}>WhatsApp</button>
          </div>
          <div className="ai-score-card">
            <div className="big-score-row">
              <div className="score-circle">94</div>
              <div><strong style={{ color: "var(--teal)" }}>AI Score: Excellent</strong><br /><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Top 6% in locality</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
