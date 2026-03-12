/**
 * @file Sidebar.tsx
 * @module admin/components
 * @description Sidebar navigation for admin panel.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearToken } from "@/lib/auth";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/properties/new", label: "New property" },
  { href: "/users", label: "Users" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)] flex flex-col min-h-screen">
      <div className="p-4 border-b border-[var(--admin-border)]">
        <span className="font-semibold text-[var(--admin-text)]">Admin</span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block rounded px-3 py-2 text-sm ${
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-[var(--admin-accent)] text-white"
                : "text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-[var(--admin-border)]">
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            clearToken();
            window.location.href = "/login";
          }}
          className="block rounded px-3 py-2 text-sm text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]"
        >
          Log out
        </a>
      </div>
    </aside>
  );
}
