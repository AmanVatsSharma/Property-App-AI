/**
 * @file Footer.tsx
 * @module layout
 * @description Site footer with links and Vedpragya credit line
 * @author BharatERP
 * @created 2025-03-10
 */

import Link from "next/link";
import { FOOTER_LINKS } from "@property-app-ai/shared";
import { FOOTER_COPY } from "@/lib/copy";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="logo flex items-center gap-2">
            <div className="logo-icon">🏙️</div>
            <span className="logo-text">
              UrbanNest<span className="ai">.ai</span>
            </span>
          </div>
          <p className="footer-desc">
            India&apos;s most intelligent real estate platform. AI-powered
            search, price intelligence and neighbourhood scoring across 340+
            cities.
          </p>
          <div className="footer-socials">
            <div className="soc">𝕏</div>
            <div className="soc">in</div>
            <div className="soc">f</div>
            <div className="soc">📸</div>
          </div>
        </div>
        <div className="footer-col">
          <h5>Discover</h5>
          <ul>
            {FOOTER_LINKS.discover.map(({ href, label }) => (
              <li key={label}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h5>AI Tools</h5>
          <ul>
            {FOOTER_LINKS.tools.map(({ href, label }) => (
              <li key={label}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            {FOOTER_LINKS.company.map(({ href, label }) => (
              <li key={label}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h5>Legal</h5>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">RERA Info</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 UrbanNest Technologies Pvt. Ltd. · DPIIT Recognised</span>
        <span>
          Built with <span className="teal">AI ✦</span> in India 🇮🇳
        </span>
      </div>
      <div
        className="footer-credits"
        role="contentinfo"
        aria-label="Platform credit"
      >
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
