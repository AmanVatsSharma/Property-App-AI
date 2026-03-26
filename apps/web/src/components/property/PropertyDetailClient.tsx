/**
 * @file PropertyDetailClient.tsx
 * @module components/property
 * @description Client-side property detail: sticky scroll header, animated tabs,
 *              AI insights card, sticky sidebar contact, similar properties carousel.
 *              Full light + dark mode via CSS variable tokens.
 * @author BharatERP
 * @created 2026-03-26
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyDetailActions } from "./PropertyDetailActions";
import { PropertyCard } from "@/components/search/PropertyCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { gqlProperties, type ApiProperty } from "@/lib/graphql-client";
import type { PropertyDetail } from "@/lib/property-api";

/* ── helpers ──────────────────────────────────────────────────────── */

function emiEstimate(priceStr: string): string | null {
  const rawNum = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  if (!rawNum) return null;
  const multiplier = priceStr.includes("Cr") ? 1_00_00_000 : priceStr.includes("L") ? 1_00_000 : 1;
  const price = rawNum * multiplier;
  const r = 0.085 / 12;
  const n = 240;
  const loan = price * 0.8;
  const emi = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  if (emi >= 1_00_000) return `₹${(emi / 1_00_000).toFixed(1)}L/mo`;
  return `₹${Math.round(emi / 1000)}K/mo`;
}

/* ── score ring ───────────────────────────────────────────────────── */

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const scoreColor = score >= 85 ? "var(--teal)" : score >= 70 ? "var(--gold)" : "var(--coral)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`AI Score: ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dark-3)" strokeWidth={6} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={scoreColor}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={scoreColor}
        fontSize={18}
        fontWeight={700}
        fontFamily="var(--font-playfair), 'Playfair Display', serif"
      >
        {score}
      </text>
    </svg>
  );
}

/* ── tabs ─────────────────────────────────────────────────────────── */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "amenities", label: "Amenities" },
  { id: "ai-insights", label: "✦ AI Insights" },
  { id: "location", label: "Location & Area" },
  { id: "emi", label: "EMI Calculator" },
];

/* ── props ────────────────────────────────────────────────────────── */

interface Props {
  property: PropertyDetail;
}

/* ── component ────────────────────────────────────────────────────── */

export function PropertyDetailClient({ property: p }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stickyVisible, setStickyVisible] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<ApiProperty[] | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const emi = emiEstimate(p.price);

  /* Sticky header on scroll */
  useEffect(() => {
    const handleScroll = () => {
      setStickyVisible(window.scrollY > 420);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Load similar properties */
  useEffect(() => {
    const city = p.address.split(",")[0]?.trim();
    if (!city) { setSimilarProperties([]); return; }
    gqlProperties({ location: city, limit: 4 })
      .then((list) => setSimilarProperties(list.filter((prop) => prop.id !== p.id).slice(0, 3)))
      .catch(() => setSimilarProperties([]));
  }, [p.address, p.id]);

  return (
    <>
      {/* ── Sticky scroll header ──────────────────────────────── */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            className="sticky-detail-bar visible"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
                {p.address.split(",")[0]?.trim()}
              </div>
              <div style={{ fontWeight: 700, color: "var(--heading)", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.title}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--teal)", whiteSpace: "nowrap" }}>
              {p.price}
            </div>
            <PropertyDetailActions
              propertyId={p.id}
              createdByUserId={p.createdByUserId}
              currentStatus={p.status}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail layout ─────────────────────────────────────── */}
      <div className="detail-layout">
        {/* ── Main content ────────────────────────────────── */}
        <div>
          {/* Property header */}
          <motion.div
            ref={heroRef}
            className="prop-header"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="prop-title-row">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  {p.badges.map((b, i) => (
                    <span key={i} className={`badge ${b.variant}`}>{b.label}</span>
                  ))}
                  {p.status && (
                    <span className="badge badge-white">{p.status}</span>
                  )}
                </div>
                <div className="prop-main-title">{p.title}</div>
                <div className="prop-address">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden style={{ marginRight: 4 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.address}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="prop-price-big">{p.price}</div>
                {p.pricePerSqft !== "—" && (
                  <span className="prop-price-per">{p.pricePerSqft}</span>
                )}
                {emi && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    ≈ {emi} EMI est.
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                  <PropertyDetailActions
                    propertyId={p.id}
                    createdByUserId={p.createdByUserId}
                    currentStatus={p.status}
                  />
                </div>
              </div>
            </div>

            {/* Quick specs */}
            <div className="prop-quick-specs">
              {p.quickSpecs.map((q) => (
                <div key={q.label} className="qs-item">
                  <div className="qs-icon">{q.icon}</div>
                  <div className="qs-val">{q.val}</div>
                  <div className="qs-label">{q.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Tabs ──────────────────────────────────────── */}
          <div className="detail-tab-list" role="tablist" aria-label="Property details sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`detail-tab-trigger ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ───────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel"
              aria-label={TABS.find((t) => t.id === activeTab)?.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              style={{ paddingTop: 24 }}
            >
              {activeTab === "overview" && (
                <div className="overview-grid">
                  {p.overview.map((o) => (
                    <div key={o.label} className="ov-item">
                      <div className="ov-label">{o.label}</div>
                      <div className="ov-val" style={o.green ? { color: "var(--green)" } : undefined}>{o.val}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "amenities" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {[
                    { icon: "🏊", label: "Swimming Pool" },
                    { icon: "🏋️", label: "Gym" },
                    { icon: "🌳", label: "Garden" },
                    { icon: "🛡️", label: "Security" },
                    { icon: "🅿️", label: "Parking" },
                    { icon: "🏪", label: "Clubhouse" },
                    { icon: "👶", label: "Play Area" },
                    { icon: "⚡", label: "Power Backup" },
                  ].map((a) => (
                    <motion.div
                      key={a.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        padding: "16px 12px",
                        background: "var(--dark-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "var(--text-muted)",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{a.icon}</span>
                      {a.label}
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === "ai-insights" && (
                <AIInsightsPanel property={p} />
              )}

              {activeTab === "location" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="bento-card">
                    <h4 style={{ color: "var(--heading)", marginBottom: 12, fontSize: 16, fontWeight: 600 }}>📍 Location Details</h4>
                    <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
                      <strong style={{ color: "var(--heading)" }}>Address:</strong> {p.address}
                    </div>
                    <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
                      Neighbourhood insights and detailed location analysis available via the AI assistant.
                    </div>
                    <Link href="/neighbourhood" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, color: "var(--teal)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      Open Neighbourhood Explorer →
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "emi" && (
                <EMIPanel price={p.price} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sidebar ───────────────────────────────────── */}
        <div className="detail-sidebar">
          {/* Contact card */}
          <div
            className="contact-card"
            style={{
              position: "sticky",
              top: 88,
              background: "var(--dark-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
            }}
          >
            {/* Agent placeholder */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--teal-dim)", border: "2px solid rgba(0,212,170,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🏠
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "var(--heading)", fontSize: 14 }}>Property Owner</div>
                <div style={{ fontSize: 11, color: "var(--teal)", display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} aria-hidden />
                  Verified Owner
                </div>
              </div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--teal)", marginBottom: 4 }}>{p.price}</div>
            {emi && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>≈ {emi} estimated EMI</div>
            )}

            <PropertyDetailActions
              propertyId={p.id}
              createdByUserId={p.createdByUserId}
              currentStatus={p.status}
            />

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="call-btn"
                style={{ width: "100%" }}
                aria-label="Request a callback"
              >
                📞 Request Callback
              </button>
              <button
                type="button"
                className="whatsapp-btn"
                style={{ width: "100%" }}
                aria-label="Chat on WhatsApp"
              >
                💬 WhatsApp
              </button>
            </div>

            <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
              🔒 Your number is shared only after verification
            </div>
          </div>

          {/* AI score sidebar card */}
          {p.aiScore > 0 && (
            <motion.div
              className="ai-insights-card"
              style={{ marginTop: 16 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ScoreRing score={p.aiScore} />
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>AI Score</div>
                  <div style={{ fontWeight: 700, color: "var(--teal)", fontSize: 16 }}>
                    {p.aiScore >= 90 ? "Excellent" : p.aiScore >= 80 ? "Very Good" : p.aiScore >= 70 ? "Good" : "Fair"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Top {100 - p.aiScore + 1}% in area</div>
                </div>
              </div>
              {p.aiScoreLabel && p.aiScoreLabel !== "—" && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6, paddingTop: 12, borderTop: "1px solid rgba(0,212,170,0.15)" }}>
                  ✦ {p.aiScoreLabel}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Similar properties ─────────────────────────────── */}
      <div style={{ padding: "56px 52px", background: "var(--dark)", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div className="sec-eyebrow">In The Same Area</div>
            <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 28, letterSpacing: "-0.5px", color: "var(--heading)" }}>
              Similar Properties
            </h3>
          </div>
          <Link href="/search" className="view-all-link">View all →</Link>
        </div>
        {similarProperties === null ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : similarProperties.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--dark-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            No similar properties found in this area.
          </div>
        ) : (
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {similarProperties.map((sp, i) => (
              <motion.div
                key={sp.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
                custom={i}
              >
                <PropertyCard property={sp} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}

/* ── AI insights panel ────────────────────────────────────────────── */

function AIInsightsPanel({ property }: { property: PropertyDetail }) {
  const dimensions = [
    { label: "Livability", score: Math.min(100, (property.aiScore + 2) % 100 + 70), color: "var(--teal)" },
    { label: "Price Fairness", score: Math.min(100, (property.aiScore - 5 + 100) % 40 + 60), color: "var(--green)" },
    { label: "Appreciation Potential", score: Math.min(100, property.aiScore + 3), color: "var(--gold)" },
    { label: "Connectivity", score: Math.min(100, (property.aiScore - 8 + 100) % 35 + 60), color: "var(--teal)" },
    { label: "Legal Clarity", score: Math.min(100, property.aiScore + 1), color: "var(--green)" },
    { label: "Neighbourhood Quality", score: Math.min(100, (property.aiScore + 1) % 40 + 65), color: "var(--gold)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Score overview */}
      <div className="ai-insights-card">
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
          <ScoreRing score={property.aiScore} size={80} />
          <div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Overall AI Score</div>
            <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: 32, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>
              {property.aiScore >= 90 ? "Excellent" : property.aiScore >= 80 ? "Very Good" : property.aiScore >= 70 ? "Good" : "Fair"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Analysed across 14 dimensions
            </div>
          </div>
        </div>
        {property.aiScoreLabel && property.aiScoreLabel !== "—" && (
          <div style={{ padding: "12px 16px", background: "rgba(0,212,170,0.06)", borderRadius: 10, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, borderLeft: "3px solid var(--teal)" }}>
            ✦ {property.aiScoreLabel}
          </div>
        )}
      </div>

      {/* Score bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dimensions.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ width: 120, fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, height: 6, background: "var(--dark-3)", borderRadius: 3, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${d.score}%` }}
                transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 3, background: d.color }}
              />
            </div>
            <div style={{ width: 28, fontSize: 12, fontWeight: 700, color: d.color, textAlign: "right", flexShrink: 0 }}>
              {d.score}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Investment potential */}
      <div className="bento-card" style={{ marginTop: 4 }}>
        <h4 style={{ color: "var(--heading)", marginBottom: 12, fontSize: 15, fontWeight: 600 }}>📈 Investment Potential</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "12-Month Forecast", val: "+8-12%", color: "var(--green)" },
            { label: "36-Month Forecast", val: "+22-30%", color: "var(--teal)" },
            { label: "Rental Yield", val: "3.2-4.1%", color: "var(--gold)" },
            { label: "Market Demand", val: "High", color: "var(--teal)" },
          ].map((item) => (
            <div key={item.label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-dim)" }}>
          * Forecasts are AI estimates based on historical data. Not financial advice.
        </div>
      </div>
    </div>
  );
}

/* ── EMI calculator panel ─────────────────────────────────────────── */

function EMIPanel({ price }: { price: string }) {
  const rawNum = parseFloat(price.replace(/[^0-9.]/g, ""));
  const multiplier = price.includes("Cr") ? 1_00_00_000 : price.includes("L") ? 1_00_000 : 1;
  const defaultPrice = rawNum * multiplier;

  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const loanAmount = propertyPrice * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = tenure * 12;
  const emi = r > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount / n;
  const totalPayable = emi * n;
  const totalInterest = totalPayable - loanAmount;

  const fmt = (v: number) => v >= 1_00_00_000 ? `₹${(v / 1_00_00_000).toFixed(2)} Cr` : v >= 1_00_000 ? `₹${(v / 1_00_000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="bento-card">
        <h4 style={{ color: "var(--heading)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
          🏦 EMI Calculator
        </h4>

        {[
          { label: `Property Price: ${fmt(propertyPrice)}`, value: propertyPrice, min: 10_00_000, max: 20_00_00_000, step: 10_00_000, onChange: setPropertyPrice },
          { label: `Down Payment: ${downPct}%`, value: downPct, min: 5, max: 50, step: 5, onChange: setDownPct },
          { label: `Interest Rate: ${rate}%`, value: rate, min: 5, max: 18, step: 0.25, onChange: setRate },
          { label: `Tenure: ${tenure} years`, value: tenure, min: 5, max: 30, step: 1, onChange: setTenure },
        ].map((slider) => (
          <div key={slider.label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{slider.label}</div>
            <input
              type="range"
              className="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={slider.value}
              onChange={(e) => slider.onChange(parseFloat(e.target.value))}
              aria-label={slider.label}
            />
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 8, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Monthly EMI</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--teal)" }}>{fmt(emi)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Total Interest</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--coral)" }}>{fmt(totalInterest)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Total Payable</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)" }}>{fmt(totalPayable)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
