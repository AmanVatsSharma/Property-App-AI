/**
 * File:        apps/web/src/app/trust/page.tsx
 * Module:      Web · Trust & Verification (route)
 * Purpose:     Premium "how we protect buyers" positioning page. Surfaces the
 *              platform's trust pillars (verified listings, RERA verification,
 *              AI scoring methodology, document review, fraud detection) so a
 *              first-time visitor can answer "why should I trust this platform"
 *              before they list, transact, or share their phone number.
 *
 * Exports:
 *   - metadata             — Next.js page metadata (title/description/OG)
 *   - default TrustPage    — server component rendering the trust page
 *
 * Depends on:
 *   - @/lib/seo (buildMetadata)  — central metadata builder (OG, Twitter, JSON-LD)
 *   - @/components/ui/Badge      — premium badge primitive
 *   - @/components/ui/Button     — premium button primitive
 *
 * Side-effects: none (pure render).
 *
 * Key invariants:
 *   - All copy claims are tied to features that ACTUALLY exist in the
 *     codebase (verified-listing flag, RERA-check tool, AI score on
 *     properties, document analysis tool). Don't add a pillar here that
 *     doesn't have a real implementation behind it — that would be deceptive.
 *
 * Read order:
 *   1. PILLARS                 — the trust copy + icon mapping
 *   2. TrustPage()             — page composition (hero + pillars + CTA)
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Trust & Verification — How UrbanNest.ai protects buyers",
  description:
    "Verified listings, RERA registration check, AI document review, and a 0-rupee fraud-protection promise. Built for the Indian real-estate market.",
  path: "/trust",
  keywords: [
    "verified property India",
    "RERA verification",
    "real estate fraud protection",
    "property document check India",
  ],
});

interface TrustPillar {
  badge: string;
  badgeVariant: "teal" | "gold" | "coral" | "indigo" | "green";
  title: string;
  body: string;
  proofPoints: string[];
  cta?: { label: string; href: string };
}

const PILLARS: TrustPillar[] = [
  {
    badge: "✓ Verified",
    badgeVariant: "teal",
    title: "Verified listings, before you call",
    body: "Each verified listing has been reviewed against ownership, title, and photo-genuineness signals. Listings that pass show a verified shield on the card, on the detail page, and in side-by-side comparisons.",
    proofPoints: [
      "Photo authenticity checks against duplicate stock imagery",
      "Owner / broker contact verified at submission",
      "Title-mismatch flags surface during agent review",
      "Verified-only filter in search and saved searches",
    ],
    cta: { label: "Browse verified listings", href: "/search?verified=true" },
  },
  {
    badge: "RERA",
    badgeVariant: "indigo",
    title: "RERA check, with a portal handoff",
    body: "Ask the AI assistant to verify any project — it returns the registration status, the relevant state RERA portal, and a next-step nudge. We never invent a registration number; when uncertain, we say 'unknown' and send you to the official source.",
    proofPoints: [
      "20 state RERA portals + national fallback",
      "AI assistant explicitly forbidden from fabricating registration IDs",
      "Status: registered / unknown / not found / expired",
      "Deep-link to the right portal for manual verification",
    ],
    cta: { label: "Run a RERA check", href: "/legal-checker" },
  },
  {
    badge: "✦ AI Score",
    badgeVariant: "gold",
    title: "AI scores you can audit",
    body: "Every listing has a 0–100 AI score combining locality liveability, connectivity, schools, safety, and price-trend signals. The score is explainable — open any property to see the area-by-area breakdown that produced it.",
    proofPoints: [
      "Score blends 5 area factors + price-per-sqft",
      "Persisted on the property entity, never just inferred at view time",
      "Visible on cards, detail pages, and the compare view",
      "Sortable: 'AI Score' is a first-class sort option in search",
    ],
    cta: { label: "See AI scoring in action", href: "/search?sort=aiScore" },
  },
  {
    badge: "Document",
    badgeVariant: "coral",
    title: "AI document review, before you sign",
    body: "Paste a sale deed, NOC, encumbrance certificate, or agreement-to-sell into the legal checker. The AI surfaces red / yellow / green risk flags, positives, and recommended next actions. Always paired with a 'this is not legal advice — engage a lawyer' disclaimer.",
    proofPoints: [
      "Risk categories: title chain, encumbrance, stamp duty, signatures, RERA",
      "Bounded input length (12k chars) to keep cost predictable",
      "Always emits action items, not just findings",
      "Disclaimer surfaced on every response",
    ],
    cta: { label: "Try the document checker", href: "/legal-checker" },
  },
  {
    badge: "Negotiation",
    badgeVariant: "green",
    title: "Negotiation insights, not pressure",
    body: "Ask the AI for a fair offer on any listing. It blends listing data, locality intelligence, and a 12-month price forecast to suggest an offer (₹) and bid strategy. The suggestion is clamped to a sensible range so the AI never tells you to lowball into the trash bin.",
    proofPoints: [
      "Offer is clamped to 85–100% of ask (defence against bad LLM output)",
      "Includes negotiation script + walk-away conditions",
      "Demand-aware: cooler markets = more leeway, hot markets = less",
      "Falls back to a deterministic 3–7% baseline if AI is offline",
    ],
  },
  {
    badge: "Privacy",
    badgeVariant: "teal",
    title: "Your data, on your terms",
    body: "Phone-only sign-in via OTP — no passwords to leak. Conversations with the AI are scoped to your account; we don't sell prompts or property browsing data. JWT auth, Helmet headers, and CORS-locked origins ship by default in production.",
    proofPoints: [
      "OTP is bcrypt-hashed at rest (never logged)",
      "JWT secret enforced ≥ 16 chars in production",
      "CORS origins explicit (no wildcard) in production",
      "Per-user agent conversations, never shared across accounts",
    ],
  },
];

export default function TrustPage() {
  return (
    <main id="main-content" className="page-wrap">
      <header
        style={{
          padding: "72px 28px 56px",
          textAlign: "center",
          maxWidth: 880,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <Badge variant="teal">✦ Trust & Verification</Badge>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(36px, 5.6vw, 60px)",
            fontWeight: 600,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Real estate is{" "}
          <em className="teal" style={{ fontStyle: "italic", color: "var(--teal)" }}>
            stressful enough.
          </em>
          <br />
          Trust shouldn’t be.
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 640,
            margin: 0,
          }}
        >
          Six concrete things UrbanNest.ai does — backed by code you can audit —
          to protect buyers in the Indian real-estate market.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Link href="/search?verified=true">
            <Button variant="default" size="lg">
              See verified listings
            </Button>
          </Link>
          <Link href="/legal-checker">
            <Button variant="outline" size="lg">
              Try the legal checker
            </Button>
          </Link>
        </div>
      </header>

      <section
        aria-label="Trust pillars"
        style={{
          padding: "0 28px 96px",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {PILLARS.map((pillar) => (
          <article
            key={pillar.title}
            data-testid={`trust-pillar-${pillar.badge.replace(/\s+/g, "-")}`}
            style={{
              padding: 28,
              borderRadius: 18,
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transition: "transform 0.2s, border-color 0.2s",
            }}
          >
            <Badge variant={pillar.badgeVariant}>{pillar.badge}</Badge>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 22,
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {pillar.title}
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              {pillar.body}
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {pillar.proofPoints.map((point) => (
                <li
                  key={point}
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    paddingLeft: 18,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      color: "var(--teal)",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            {pillar.cta ? (
              <Link
                href={pillar.cta.href}
                style={{
                  marginTop: 6,
                  alignSelf: "flex-start",
                  color: "var(--teal)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {pillar.cta.label} →
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      <section
        aria-labelledby="report-concern"
        style={{
          padding: "48px 28px 96px",
          maxWidth: 880,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "44px 28px",
            borderRadius: 22,
            border: "1px solid rgba(0,212,170,0.25)",
            background:
              "linear-gradient(135deg, var(--teal-dim), rgba(0,212,170,0.04))",
          }}
        >
          <h2
            id="report-concern"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(24px, 3.5vw, 34px)",
              fontWeight: 600,
              margin: 0,
              marginBottom: 12,
            }}
          >
            Saw something off?
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 540, margin: "0 auto 18px", lineHeight: 1.6 }}>
            Suspicious listing, fake photos, RERA mismatch, or a broker pressuring you?
            Tell us. Every report goes to a human reviewer within 24 hours.
          </p>
          <Link href="mailto:trust@urbannest.ai?subject=Trust%20concern">
            <Button variant="default" size="lg">
              Report a concern
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
