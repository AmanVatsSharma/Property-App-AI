/**
 * File:        src/components/layout/MobileNav.tsx
 * Module:      Owner Dashboard — Layout
 * Purpose:     Bottom tab bar for mobile navigation
 *
 * Exports:
 *   - MobileNav                       — bottom tab bar (mobile only)
 *
 * Depends on:
 *   - lucide-react                   — icons
 *   - next/navigation                — usePathname
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t md:hidden"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      {mobileItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
              isActive ? "" : "opacity-60"
            )}
            style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
