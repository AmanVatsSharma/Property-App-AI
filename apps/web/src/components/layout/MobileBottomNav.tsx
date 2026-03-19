/**
 * @file MobileBottomNav.tsx
 * @module layout
 * @description Fixed bottom navigation for mobile (≤1023px).
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAIFab } from "@/components/providers/AIFabProvider";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/post-property", label: "Post", icon: "+" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { setOpen } = useAIFab();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav-inner">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`mbn-item ${pathname === href ? "active" : ""}`}
            aria-label={label}
          >
            <span className="mbn-icon" aria-hidden>
              {icon}
            </span>
            <span>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          className="mbn-item"
          onClick={() => setOpen(true)}
          aria-label="AI Assistant"
        >
          <span className="mbn-icon" aria-hidden>
            ✦
          </span>
          <span>AI</span>
        </button>
      </div>
    </nav>
  );
}
