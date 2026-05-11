/**
 * File:        src/components/layout/Header.tsx
 * Module:      Owner Dashboard — Layout
 * Purpose:     Top header bar with page title, search, user menu
 *
 * Exports:
 *   - Header                          — top bar with user dropdown
 *
 * Depends on:
 *   - lucide-react                    — icons
 *   - @/lib/auth                     — removeToken()
 *   - next/navigation                — useRouter
 *
 * Side-effects:
 *   - clears localStorage on logout
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { removeToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      {/* Page title */}
      <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
          />
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              A
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Admin
            </span>
            <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border py-1 shadow-xl"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 text-sm"
                style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
              >
                <User className="h-4 w-4" />
                Admin User
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--danger)" }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
