/**
 * @file SkipToContent.tsx
 * @module ui
 * @description Skip-to-content link for keyboard and a11y
 * @author BharatERP
 * @created 2025-03-10
 */

import Link from "next/link";

const skipId = "main-content";

export function SkipToContent() {
  return (
    <Link
      href={`#${skipId}`}
      className="fixed left-4 top-4 z-[1000] -translate-y-[120%] bg-[var(--teal)] text-[var(--night)] font-bold py-3 px-5 rounded-xl focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--white)] focus:ring-offset-2 focus:ring-offset-[var(--night)] transition-transform"
    >
      Skip to main content
    </Link>
  );
}

export const MAIN_CONTENT_ID = skipId;
