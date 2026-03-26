/**
 * @file Footer.tsx
 * @module layout
 * @description Premium footer: brand + tagline, link columns, RERA badge,
 *              trust badges, social icons, newsletter CTA, credits.
 *              Full light + dark mode via CSS variable tokens.
 * @author BharatERP
 * @created 2025-03-10
 * @updated 2026-03-26
 */

import Link from "next/link";
import { FOOTER_LINKS } from "@property-app-ai/shared";
import { FOOTER_COPY } from "@/lib/copy";

export default function Footer() {
  return (
    <footer>
      {/* Newsletter bar */}
      <div
        style={{
          padding: "28px 52px",
          background: "linear-gradient(90deg, rgba(0,212,170,0.06), var(--dark), rgba(99,102,241,0.06))",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>
            🔔 Get AI Price Alerts
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Know when prices drop in localities you follow — free, no spam.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <input
            type="email"
            placeholder="your@email.com"
            className="input"
            style={{ width: 220, padding: "9px 14px", fontSize: 13 }}
            aria-label="Email for price alerts newsletter"
          />
          <button type="button" className="btn-primary" style={{ padding: "9px 20px", whiteSpace: "nowrap" }}>
            Get Alerts ✦
          </button>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="footer-grid">
        {/* Brand column */}
        <div>
          <Link href="/" className="logo" aria-label="KonKreet home">
            <div className="logo-icon" aria-hidden>🏙️</div>
            <span className="logo-text">KonKreet</span>
          </Link>
          <p className="footer-desc">
            India&apos;s most intelligent real estate platform. AI-powered search, price intelligence and neighbourhood scoring across 340+ cities.
          </p>

          {/* RERA badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "var(--green-dim)",
              border: "1px solid rgba(74,222,128,0.25)",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--green)",
            }}
          >
            ✅ RERA Registered · Verified Platform
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["🏆 DPIIT Recognised", "🔒 ISO 27001", "🛡️ SSL Secured"].map((badge) => (
              <span
                key={badge}
                style={{
                  fontSize: 10,
                  color: "var(--text-dim)",
                  padding: "3px 8px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Social icons */}
          <div className="footer-socials" aria-label="Social media links">
            {[
              { label: "X (Twitter)", icon: "𝕏", href: "#" },
              { label: "LinkedIn", icon: "in", href: "#" },
              { label: "Facebook", icon: "f", href: "#" },
              { label: "Instagram", icon: "📸", href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="soc"
                aria-label={s.label}
                rel="noopener noreferrer"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Discover column */}
        <div className="footer-col">
          <h5>Discover</h5>
          <ul>
            {FOOTER_LINKS.discover.map(({ href, label }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
            <li><Link href="/favorites">Saved Properties</Link></li>
          </ul>
        </div>

        {/* AI Tools column */}
        <div className="footer-col">
          <h5>AI Tools</h5>
          <ul>
            {FOOTER_LINKS.tools.map(({ href, label }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company column */}
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            {FOOTER_LINKS.company.map(({ href, label }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
            <li><Link href="/post-property">Post Property Free</Link></li>
            <li><Link href="/broker">Broker Dashboard</Link></li>
          </ul>
        </div>

        {/* Legal column */}
        <div className="footer-col">
          <h5>Legal &amp; Help</h5>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">RERA Compliance</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Report Issue</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 KonKreet Technologies Pvt. Ltd. · DPIIT Recognised Startup</span>
        <span>
          Made with <span className="teal">♥ &amp; AI</span> in India 🇮🇳
        </span>
      </div>

      {/* Credits */}
      <div className="footer-credits" role="contentinfo" aria-label="Platform credit">
        <span>
          {FOOTER_COPY.poweredBy}
          <a
            href={FOOTER_COPY.vedpragyaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-credits-link"
            data-testid="footer-vedpragya-link"
          >
            {FOOTER_COPY.vedpragya}
          </a>
          {FOOTER_COPY.tagline}
        </span>
      </div>
    </footer>
  );
}
