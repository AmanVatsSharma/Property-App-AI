/**
 * @file AnnouncementBar.tsx
 * @module layout
 * @description Top announcement bar for UrbanNest.ai
 * @author BharatERP
 * @created 2025-03-10
 */

import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="ann-bar">
      <span className="ann-pill">NEW</span>
      AI Copilot 2.0 launched — smarter matching, legal scanner & EMI optimizer{" "}
      <Link href="/search" className="ann-link">
        Try free →
      </Link>
    </div>
  );
}
