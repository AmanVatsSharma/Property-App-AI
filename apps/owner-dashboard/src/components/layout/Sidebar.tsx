/**
 * File:        src/components/layout/Sidebar.tsx
 * Module:      Owner Dashboard — Layout
 * Purpose:     Navigation sidebar with route links and active state
 *
 * Exports:
 *   - Sidebar                         — full sidebar component
 *
 * Depends on:
 *   - lucide-react                   — icon library
 *   - next/navigation                — usePathname
 *   - next/link                      — Client-side navigation
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
  Users,
  Bot,
  BarChart3,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/ai", label: "AI Monitor", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col border-r"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            UrbanNest
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Owner Dashboard
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : ""
              )}
              style={{
                backgroundColor: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "white" : "var(--text-muted)",
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="border-t px-6 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          UrbanNest.ai v1.0
        </div>
      </div>
    </aside>
  );
}
