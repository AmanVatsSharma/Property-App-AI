/**
 * @file LandingPage.tsx
 * @module landing
 * @description World-class landing page — immersive hero, Framer Motion animations,
 *              animated counters, bento AI features, premium city cards, dual CTA.
 *              Full light + dark mode support via CSS variable tokens.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { DEMO_IMAGES } from "@/lib/demo-images";
import { PropertyCard } from "@/components/search/PropertyCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { SEARCH_TABS } from "@property-app-ai/shared";
import { useAIFab } from "@/components/providers/AIFabProvider";
import { gqlProperties, type ApiProperty } from "@/lib/graphql-client";

/* ── constants ────────────────────────────────────────────────────── */

const PLACEHOLDERS = [
  "e.g. 3BHK near good school, walkable to metro, Pune under ₹1.2Cr",
  "e.g. 2BHK investment with high rental yield in Hyderabad",
  "e.g. Luxury villa with pool in Gurgaon under ₹4Cr",
  "e.g. 1BHK near IT park in Whitefield Bangalore under ₹50L",
];

/** Marketing copy — not live data. */
const CITIES = [
  { name: "Mumbai", count: "4.2L+", trend: "↑ 22% YoY", color: "#0ea5e9", accent: "rgba(14,165,233,0.15)", emoji: "🌆" },
  { name: "Bangalore", count: "3.8L+", trend: "↑ 31% YoY", color: "#22c55e", accent: "rgba(34,197,94,0.15)", emoji: "🏙️" },
  { name: "Delhi NCR", count: "5.1L+", trend: "↑ 18% YoY", color: "#a855f7", accent: "rgba(168,85,247,0.15)", emoji: "🗼" },
  { name: "Hyderabad", count: "2.6L+", trend: "↑ 27% YoY", color: "#00d4aa", accent: "rgba(0,212,170,0.15)", emoji: "🌃" },
  { name: "Pune", count: "1.9L+", trend: "↑ 24% YoY", color: "#f59e0b", accent: "rgba(245,158,11,0.15)", emoji: "🌇" },
  { name: "Chennai", count: "1.4L+", trend: "↑ 15% YoY", color: "#f97316", accent: "rgba(249,115,22,0.15)", emoji: "🏛️" },
  { name: "Kolkata", count: "1.1L+", trend: "↑ 11% YoY", color: "#ec4899", accent: "rgba(236,72,153,0.15)", emoji: "🌉" },
  { name: "Ahmedabad", count: "0.9L+", trend: "↑ 19% YoY", color: "#6366f1", accent: "rgba(99,102,241,0.15)", emoji: "🕌" },
];

const STATS = [
  { target: 2.4, decimals: 1, suffix: "M+", label: "Active Listings", sub: "↑ 12% this month" },
  { target: 1.2, decimals: 1, suffix: "L+", label: "Families Helped", sub: "↑ 8% this month" },
  { target: 340, decimals: 0, suffix: "+", label: "Indian Cities", sub: "Tier 1, 2 & 3" },
  { target: 18, decimals: 0, prefix: "₹", suffix: "K", label: "Avg. Savings", sub: "Per transaction" },
];

const AI_FEATURES = [
  {
    icon: "🧠",
    title: "Conversational AI Search",
    desc: "Describe your dream home in plain English. Our GPT-4 powered engine understands intent, budget, and lifestyle — not just keywords.",
    badge: "GPT-4 Powered",
    color: "var(--teal)",
    bg: "var(--teal-dim)",
    border: "rgba(0,212,170,0.2)",
    num: "4x",
    numLabel: "faster to find",
  },
  {
    icon: "📊",
    title: "Price Intelligence",
    desc: "Know instantly if a property is overpriced or undervalued — backed by ₹2.4 trillion in verified Indian transaction data.",
    badge: "10M+ Data Points",
    color: "var(--coral)",
    bg: "var(--coral-dim)",
    border: "rgba(255,107,74,0.2)",
    num: "89%",
    numLabel: "accuracy rate",
  },
  {
    icon: "🗺️",
    title: "Neighbourhood AI",
    desc: "Score any locality on safety, commute, schools, hospitals and 40+ signals. Make informed decisions — not gambles.",
    badge: "40+ Signals",
    color: "var(--gold)",
    bg: "var(--gold-dim)",
    border: "rgba(245,200,66,0.2)",
    num: "40+",
    numLabel: "liveability signals",
  },
];

const TRUST_ITEMS = [
  { icon: "✅", label: "RERA Verified" },
  { icon: "🔒", label: "Zero Spam" },
  { icon: "🤖", label: "AI Validated" },
  { icon: "📋", label: "Legal Shield" },
  { icon: "🇮🇳", label: "Made for India" },
];

const TESTIMONIALS = [
  {
    quote: "The AI search is genuinely magical. Typed a paragraph and it showed exactly what I wanted. Bought in 3 weeks.",
    savings: "Saved ₹14 lakhs via AI Price Check",
    name: "Priya Sharma",
    detail: "3BHK in Sector 62, Noida · ₹1.1 Cr",
    avatarIndex: 0,
    stars: 5,
  },
  {
    quote: "The Price Intelligence feature showed the asking price was 12% above market. I negotiated down and closed the deal.",
    savings: "Saved ₹8 lakhs via Negotiation Coach",
    name: "Arjun Mehta",
    detail: "2BHK in Baner, Pune · ₹76 L",
    avatarIndex: 1,
    stars: 5,
  },
  {
    quote: "As a first-time buyer moving from Delhi to Bangalore, neighbourhood AI helped me pick the perfect locality.",
    savings: "Found ideal home in 11 days",
    name: "Ananya Singh",
    detail: "Koramangala, Bangalore · ₹38K/mo",
    avatarIndex: 2,
    stars: 5,
  },
];

/* ── animation variants ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── sub-components ───────────────────────────────────────────────── */

function AnimatedCounter({
  target,
  decimals,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}

function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────── */

export default function LandingPage() {
  const { setOpen: openAIPanel, openPanelWithPrompt } = useAIFab();
  const [activeTab, setActiveTab] = useState("buy");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<ApiProperty[] | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  /* Rotating placeholder */
  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  /* Featured listings */
  useEffect(() => {
    let cancelled = false;
    setFeaturedLoading(true);
    (async () => {
      try {
        const list = await gqlProperties({ limit: 3, sortBy: "createdAt", sortOrder: "desc" });
        if (!cancelled) { setFeaturedProperties(list); setFeaturedError(null); }
      } catch (e) {
        if (!cancelled) {
          setFeaturedProperties([]);
          setFeaturedError(e instanceof Error ? e.message : "Failed to load featured properties");
        }
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = useCallback(() => {
    openPanelWithPrompt(heroSearchQuery.trim() || "Find my perfect home");
  }, [heroSearchQuery, openPanelWithPrompt]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="hero"
        style={{
          background: "var(--night)",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 52px 80px",
        }}
      >
        {/* Animated gradient glows */}
        <motion.div
          className="hero-glow-1"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-glow-2"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Indigo glow (new accent) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            top: "10%",
            right: "10%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Animated grid */}
        <div className="skyline" aria-hidden>
          <svg viewBox="0 0 1400 260" preserveAspectRatio="xMidYMax meet" fill="rgba(0,212,170,0.08)">
            <rect x="0" y="120" width="60" height="140" /><rect x="20" y="80" width="20" height="180" />
            <rect x="70" y="140" width="40" height="120" /><rect x="120" y="60" width="50" height="200" />
            <rect x="180" y="100" width="30" height="160" /><rect x="220" y="70" width="60" height="190" />
            <rect x="290" y="120" width="40" height="140" /><rect x="340" y="50" width="70" height="210" />
            <rect x="420" y="90" width="50" height="170" /><rect x="525" y="60" width="55" height="200" />
            <rect x="590" y="110" width="45" height="150" /><rect x="645" y="40" width="65" height="220" />
            <rect x="720" y="80" width="50" height="180" /><rect x="830" y="55" width="60" height="205" />
            <rect x="900" y="100" width="45" height="160" /><rect x="1020" y="120" width="40" height="140" />
            <rect x="1070" y="45" width="70" height="215" /><rect x="1150" y="90" width="50" height="170" />
            <rect x="1320" y="80" width="45" height="180" />
          </svg>
        </div>

        <motion.div
          className="hero-content"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Live pill */}
          <motion.div variants={fadeUp} custom={0} className="hero-pill">
            <div className="pill-live">
              <div className="pill-dot" aria-hidden /> Live Market Data
            </div>
            India&apos;s Most Intelligent Real Estate Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", textAlign: "center" }}
          >
            Search Smarter.
            <br />
            <span
              className="gradient-text-teal"
              style={{ fontStyle: "italic" }}
            >
              Buy Better.
            </span>
            <br />
            <span className="line-outline">Live Richer.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="hero-sub">
            KonKreet is powered by AI that understands what you actually want — not just keywords. Verified listings, real price intelligence, and neighbourhood insights across 340+ Indian cities.
          </motion.p>

          {/* Search card */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="search-mega"
          >
            <div
              className="search-card"
              style={{
                transition: "box-shadow 0.3s",
                boxShadow: searchFocused
                  ? "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.25), 0 0 40px rgba(0,212,170,0.1)"
                  : "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.08)",
              }}
            >
              {/* Search type tabs */}
              <div className="search-tabs-row">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? "stab active" : "stab"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="stab-dot" aria-hidden /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input row */}
              <div className="search-row">
                <div className="search-ai-badge" aria-hidden>✦ AI</div>
                <div className="search-divider" aria-hidden />
                <AnimatePresence mode="wait">
                  <motion.input
                    key={placeholderIndex}
                    className="search-field"
                    placeholder={PLACEHOLDERS[placeholderIndex]}
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                    aria-label="AI-powered property search. Describe what you want in plain language."
                    data-testid="landing-ai-search-input"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.7 }}
                    transition={{ duration: 0.4 }}
                  />
                </AnimatePresence>
                <div className="search-filters">
                  <button type="button" className="filter-btn" aria-label="Filter by size">📐 Size</button>
                  <button type="button" className="filter-btn" aria-label="Filter by budget">💰 Budget</button>
                </div>
                <button
                  type="button"
                  className="search-go"
                  onClick={handleSearch}
                  aria-label="Open AI assistant"
                  data-testid="landing-try-ai-cta"
                >
                  Try AI ✦
                </button>
                <Link
                  href="/search"
                  className="search-go"
                  style={{ marginLeft: 4, textDecoration: "none" }}
                  aria-label="Go to search page"
                >
                  Search →
                </Link>
              </div>

              {/* Trending chips */}
              <div className="search-suggestions">
                <span className="suggest-label">Trending:</span>
                {["Gurgaon Sector 65", "Noida Expressway", "Baner Pune", "Whitefield Blr", "BKC Mumbai"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="suggest-chip"
                    onClick={() => { setHeroSearchQuery(chip); openPanelWithPrompt(chip); }}
                  >
                    {chip}
                  </button>
                ))}
                <span className="trend-badge">↑ 18% price jump in Hyderabad</span>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div variants={fadeUp} custom={4} className="hero-stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-num">
                  <span className="unit" style={{ fontSize: 18, color: "var(--teal)" }}>{s.prefix ?? ""}</span>
                  <AnimatedCounter
                    target={s.target}
                    decimals={s.decimals}
                    suffix={s.suffix}
                  />
                </div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-delta">{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────── */}
      <div className="trust-bar">
        {TRUST_ITEMS.map((item, i) => (
          <div key={item.label}>
            {i > 0 && <div className="trust-divider" aria-hidden />}
            <motion.div
              className="trust-item"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <div className="trust-icon" aria-hidden>{item.icon}</div>
              {item.label}
            </motion.div>
          </div>
        ))}
      </div>

      {/* ── PARTNER LOGOS ─────────────────────────────────────────── */}
      <SectionReveal>
        <div
          style={{
            padding: "28px 52px",
            borderBottom: "1px solid var(--border)",
            background: "var(--dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 16 }}>
            Trusted &amp; Partnered With
          </span>
          {["HDFC Bank", "SBI Home Loans", "RERA India", "99acres Data", "MagicBricks API", "Google Play ★4.8", "App Store ★4.7"].map((logo) => (
            <span key={logo} className="partner-logo">{logo}</span>
          ))}
        </div>
      </SectionReveal>

      {/* ── CITY GRID ─────────────────────────────────────────────── */}
      <section className="city-section">
        <SectionReveal>
          <div className="sec-eyebrow">Explore by City</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2 className="sec-title">
              India&apos;s Hottest<br />Real Estate <em>Markets</em>
            </h2>
            <Link href="/search" className="view-all-link">All 340+ cities →</Link>
          </div>
        </SectionReveal>
        <motion.div
          className="cities-row"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          style={{ marginTop: 44 }}
        >
          {CITIES.map((c, i) => (
            <motion.div
              key={c.name}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href={`/search?location=${encodeURIComponent(c.name)}`}
                className="city-card"
                style={{ display: "block", textDecoration: "none" }}
                aria-label={`Search properties in ${c.name}`}
              >
                <div
                  className="city-img"
                  style={{
                    background: `radial-gradient(ellipse at 50% 30%, ${c.accent} 0%, rgba(15,22,35,0.95) 70%)`,
                    borderBottom: `1px solid ${c.color}22`,
                  }}
                >
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
                  {/* Trending badge on top 3 */}
                  {i < 3 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: `${c.color}22`,
                        border: `1px solid ${c.color}44`,
                        color: c.color,
                        borderRadius: 100,
                        padding: "2px 8px",
                        fontSize: 10,
                        fontWeight: 700,
                        zIndex: 2,
                      }}
                    >
                      🔥 Hot
                    </div>
                  )}
                </div>
                <div className="city-info">
                  <div className="city-name">{c.name}</div>
                  <div className="city-count">{c.count} listings</div>
                  <div className="city-trend" style={{ color: c.color }}>{c.trend}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────────── */}
      <section className="section listings-section">
        <SectionReveal>
          <div className="listings-header">
            <div>
              <div className="sec-eyebrow">AI-Curated Picks</div>
              <h2 className="sec-title">Properties You&apos;ll <em>Love</em></h2>
            </div>
            <Link href="/search" className="view-all-link">View all listings →</Link>
          </div>
        </SectionReveal>
        <motion.div
          className="grid-3"
          style={{ gap: 20 }}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {featuredLoading ? (
            <><SkeletonCard key="sk1" /><SkeletonCard key="sk2" /><SkeletonCard key="sk3" /></>
          ) : featuredError || !featuredProperties?.length ? (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "48px 24px",
                background: "var(--dark-2)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
                {featuredError ?? "No featured properties right now."}
              </p>
              <Link href="/search" className="btn-primary" style={{ padding: "12px 24px", borderRadius: 12, textDecoration: "none" }}>
                Explore all properties →
              </Link>
            </div>
          ) : (
            featuredProperties.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} custom={i}>
                <PropertyCard property={p} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* ── HOW AI WORKS — BENTO ──────────────────────────────────── */}
      <section
        style={{
          padding: "80px 52px",
          background: "var(--dark)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <SectionReveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Why KonKreet</div>
            <h2 className="sec-title" style={{ textAlign: "center" }}>
              AI That <em>Actually</em> Works for You
            </h2>
            <p className="sec-sub" style={{ margin: "14px auto 0", textAlign: "center" }}>
              Every feature is built around how people actually search, decide and buy homes in India.
            </p>
          </div>
        </SectionReveal>

        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {AI_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4 }}
              className="ai-feature-card"
              style={{ position: "relative", overflow: "hidden" }}
            >
              {/* Subtle glow in card corner */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${f.bg} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                className="ai-feature-icon"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                  fontWeight: 700,
                  color: f.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {f.num}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                {f.numLabel}
              </div>
              <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 20, fontWeight: 600, color: "var(--heading)", marginBottom: 10 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, fontWeight: 300 }}>
                {f.desc}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 18,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  color: f.color,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ✦ {f.badge}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Extra features row */}
        <SectionReveal>
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 20 }}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: "🔮", title: "Price Forecasting", desc: "ML model predicts 12–36 month appreciation based on infra, RERA data, demand and macro signals.", badge: "89% Accuracy" },
              { icon: "🤝", title: "Negotiation Coach", desc: "Know the exact right price to offer. Analyzes comparable sales, time on market, and seller motivation.", badge: "Avg. ₹18K Savings" },
              { icon: "📋", title: "Legal Shield", desc: "Instant RERA compliance, title clarity score, and full document checklist. Know every legal risk.", badge: "100% RERA Checked" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="bento-card"
                whileHover={{ y: -3 }}
              >
                <div className="ai-feature-icon">{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 600, color: "var(--heading)", marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{f.desc}</p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 14,
                    padding: "3px 10px",
                    borderRadius: 100,
                    background: "var(--teal-dim)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    color: "var(--teal)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✦ {f.badge}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </SectionReveal>
      </section>

      {/* ── AI SCORE PANEL ────────────────────────────────────────── */}
      <section className="score-panel">
        <SectionReveal>
          <div className="sec-eyebrow">AI Property Score</div>
          <h2 className="sec-title">
            Know <em>Exactly</em><br />What You&apos;re<br />Buying
          </h2>
          <p className="sec-sub">
            Every property gets a comprehensive AI analysis across 14 dimensions — livability, legal clarity, appreciation potential, and more.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
            {[
              "Livability, safety, appreciation potential scored",
              "Legal clarity & RERA compliance checked",
              "Neighbourhood quality, schools, hospitals mapped",
              "Fair market price validated against 10M+ data points",
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--text-muted)" }}
              >
                <span style={{ color: "var(--teal)", fontSize: 16, marginTop: 1 }}>✦</span>
                {text}
              </motion.div>
            ))}
          </div>
          <Link href="/search" className="btn-primary" style={{ marginTop: 32, padding: "14px 28px", fontSize: 15, borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
            See Score for Any Property
          </Link>
        </SectionReveal>
        <div className="score-visual reveal">
          <div className="score-property-thumb-wrap">
            <Image
              src={DEMO_IMAGES.properties["prestige-sunrise-park"].cover}
              alt="Prestige Sunrise Park"
              fill
              className="score-property-thumb"
              sizes="280px"
            />
          </div>
          <div className="score-property-name">
            <span>Prestige Sunrise Park, Whitefield</span>
            <span style={{ background: "var(--teal-dim)", border: "1px solid rgba(0,212,170,0.3)", padding: "5px 14px", borderRadius: "100px", fontSize: 13, color: "var(--teal)" }}>Excellent</span>
          </div>
          <div className="overall-score">
            <div className="big-score">94</div>
            <div className="score-desc">
              <strong>AI Score: Excellent</strong>
              Top 6% in Whitefield. Strong investment with high appreciation potential.
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
            ].map((r) => (
              <div key={r.label} className="score-row">
                <span className="score-row-label">{r.label}</span>
                <div className="score-bar-bg">
                  <motion.div
                    className={`score-bar-fill ${r.orange ? "orange" : ""}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.w}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
                <span className="score-val">{r.w === 100 ? "✓" : r.w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP SECTION ───────────────────────────────────────────── */}
      <section className="map-section">
        <div className="map-card reveal">
          <div className="map-grid-bg" />
          <svg className="map-roads" viewBox="0 0 400 400" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path d="M0 200 Q100 180 200 200 Q300 220 400 200" stroke="rgba(0,212,170,0.4)" strokeWidth="2" />
            <path d="M200 0 Q180 100 200 200 Q220 300 200 400" stroke="rgba(0,212,170,0.4)" strokeWidth="2" />
          </svg>
          <div className="map-pulse" style={{ top: "28%", left: "35%" }}><div className="map-pulse-inner" /></div>
          <div className="map-pulse coral" style={{ top: "55%", left: "60%" }}><div className="map-pulse-inner" /></div>
          <div className="map-pulse gold" style={{ top: "42%", left: "20%" }}><div className="map-pulse-inner" /></div>
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
          <p className="sec-sub">AI overlays demand trends, price history, future infrastructure and livability data directly on the map.</p>
          <div className="map-feature-list">
            {[
              { icon: "🏗️", bg: "var(--teal-dim)", border: "rgba(0,212,170,0.2)", title: "Infrastructure Intelligence", desc: "See planned metro lines, highways, schools before they're built — invest ahead of the curve." },
              { icon: "🌡️", bg: "var(--coral-dim)", border: "rgba(255,107,74,0.2)", title: "Live Demand Heatmaps", desc: "Which localities are trending right now? Updated every 6 hours." },
              { icon: "📈", bg: "var(--gold-dim)", border: "rgba(245,200,66,0.2)", title: "10-Year Price History", desc: "Visualize price movement at street-level granularity. Understand trends before committing." },
            ].map((f) => (
              <div key={f.title} className="map-feat">
                <div className="map-feat-icon" style={{ background: f.bg, border: `1px solid ${f.border}` }}>{f.icon}</div>
                <div>
                  <div className="map-feat-title">{f.title}</div>
                  <div className="map-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/search" className="btn-primary" style={{ marginTop: 28, padding: "14px 28px", fontSize: 15, borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
            Explore the AI Map →
          </Link>
        </div>
      </section>

      {/* ── METRICS ROW ───────────────────────────────────────────── */}
      <div className="metrics-section">
        {[
          { num: "2.4", unit: "M", label: "Active Listings", sub: "Growing 12% monthly" },
          { num: "₹18", unit: "K", label: "Average Savings per Deal", sub: "Via AI Price Intelligence" },
          { num: "340", unit: "+", label: "Cities Covered", sub: "Tier 1, 2 & 3 India" },
          { num: "4.9", unit: "★", label: "App Store Rating", sub: "1.2L+ reviews" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="metric-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="metric-num">{m.num}<span className="plus">{m.unit}</span></div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-sub">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="testimonials-section">
        <SectionReveal>
          <div className="sec-eyebrow">Real Stories</div>
          <h2 className="sec-title">
            They Found Their<br />Home with <em>KonKreet</em>
          </h2>
        </SectionReveal>
        <motion.div
          className="testi-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              custom={i}
              className="testi-card"
              whileHover={{ y: -4 }}
            >
              <div className="testi-stars">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="star">★</span>
                ))}
              </div>
              <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testi-savings">💰 {t.savings}</div>
              <div className="testi-author">
                <div className="testi-avatar">
                  <Image
                    src={DEMO_IMAGES.testimonials[t.avatarIndex]}
                    alt={`${t.name} avatar`}
                    width={42}
                    height={42}
                    className="testi-avatar-img"
                  />
                </div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-detail">{t.detail}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── APP SECTION ───────────────────────────────────────────── */}
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
                {[
                  { src: DEMO_IMAGES.properties["prestige-sunrise-park"].cover, bg: "var(--teal-dim)", border: "rgba(0,212,170,0.2)" },
                  { src: DEMO_IMAGES.properties["m3m-golf-hills"].cover, bg: "var(--coral-dim)", border: "rgba(255,107,74,0.2)" },
                  { src: DEMO_IMAGES.cities["Delhi NCR"], bg: "var(--gold-dim)", border: "rgba(245,200,66,0.2)" },
                  { src: DEMO_IMAGES.properties["godrej-meridian"].cover, bg: "var(--glass)", border: "var(--glass-border)" },
                ].map((cell, i) => (
                  <div key={i} className="phone-feat-cell" style={{ background: cell.bg, border: `1px solid ${cell.border}` }}>
                    <Image src={cell.src} alt="" fill className="phone-feat-img" sizes="80px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="app-cta reveal">
          <div className="sec-eyebrow">Mobile App</div>
          <h2 className="sec-title">Your Pocket<br /><em>Real Estate</em><br />Advisor</h2>
          <p className="sec-sub" style={{ marginTop: 14 }}>
            All of KonKreet&apos;s power in your palm — search, save, compare and consult your AI Copilot anytime, anywhere.
          </p>
          <div className="app-features">
            {[
              "Instant AI property scoring on the go",
              "Price alerts for saved localities",
              "Virtual tours & 3D walkthroughs",
              "Push alerts when new listings match",
            ].map((f) => (
              <div key={f} className="app-feat">{f}</div>
            ))}
          </div>
          <div className="store-buttons">
            <a href="#" className="store-btn" aria-label="Download on the App Store">
              <span className="store-icon">🍎</span>
              <div className="store-text">
                <div className="store-small">Download on the</div>
                <div className="store-name">App Store</div>
              </div>
            </a>
            <a href="#" className="store-btn" aria-label="Get it on Google Play">
              <span className="store-icon">▶️</span>
              <div className="store-text">
                <div className="store-small">Get it on</div>
                <div className="store-name">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section
        className="cta-section"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(0,212,170,0.12) 0%, var(--night) 40%, rgba(99,102,241,0.1) 100%)",
          borderTop: "1px solid rgba(0,212,170,0.15)",
        }}
      >
        {/* Glow accents */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <SectionReveal>
          <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Get Started Today</div>
          <h2 style={{ textAlign: "center" }}>
            Your Dream Home<br />is One <em>Smart Search</em> Away
          </h2>
          <p style={{ textAlign: "center", maxWidth: 480, margin: "16px auto 0", color: "var(--text-muted)", fontSize: 16, lineHeight: 1.65 }}>
            Join 1.2 lakh+ families who found their perfect property with KonKreet. Free forever — no hidden charges.
          </p>
          <div className="cta-btns">
            <Link href="/search" className="btn-cta-primary" data-testid="landing-cta-search">
              Start Your AI Search — Free →
            </Link>
            <Link href="/post-property" className="btn-cta-outline">
              Post Property Free
            </Link>
          </div>
        </SectionReveal>
      </section>
    </>
  );
}
