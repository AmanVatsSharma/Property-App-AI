/**
 * @file Nav.tsx
 * @module layout
 * @description Main navigation with active state and scroll effect
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { NAV_LINKS } from "@property-app-ai/shared";
import { useAuth } from "@/components/providers/AuthProvider";
import LoginModal from "@/components/auth/LoginModal";
import { gqlMe } from "@/lib/graphql-client";

function getActiveLabel(pathname: string): string | null {
  if (pathname === "/search") return "Buy";
  if (pathname === "/about") return null;
  if (pathname === "/post-property") return null;
  if (pathname === "/emi-calculator") return null;
  if (pathname === "/legal-checker") return null;
  if (pathname === "/neighbourhood") return null;
  if (pathname === "/price-forecast") return "Market Pulse";
  return "Buy";
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, token, signOut, openLoginModal, setOpenLoginModal } = useAuth();
  const [profileUser, setProfileUser] = useState<{ displayName: string | null; phone: string } | null>(null);
  const activeLabel = getActiveLabel(pathname ?? "");

  useEffect(() => {
    if (!isAuthenticated || !token) {
      queueMicrotask(() => setProfileUser(null));
      return;
    }
    let cancelled = false;
    gqlMe({ Authorization: `Bearer ${token}` })
      .then((user) => { if (!cancelled && user) setProfileUser({ displayName: user.displayName, phone: user.phone }); })
      .catch(() => { if (!cancelled) setProfileUser(null); });
    return () => { cancelled = true; };
  }, [isAuthenticated, token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        id="mainNav"
        className={scrolled ? "scrolled" : ""}
        style={{ top: "33px" }}
      >
        <Link href="/" className="logo" onClick={closeMenu}>
          <div className="logo-icon">🏙️</div>
          <span className="logo-text">
            UrbanNest<span className="ai">.ai</span>
          </span>
        </Link>
        <div className="nav-pills">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={activeLabel === label ? "npill active" : "npill"}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="nav-r">
          <button
            type="button"
            className="nbtn-ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link href="/about" className="nbtn-ghost">
            About
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                className="nbtn-ghost"
                onClick={() => setProfileOpen((o) => !o)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                Profile
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" aria-hidden onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 py-2 min-w-[160px] rounded-lg bg-[var(--dark)] border border-[var(--border)] shadow-lg z-[91]">
                    <p className="px-3 py-1 text-sm text-[var(--text-muted)]">
                      {profileUser?.displayName
                        ? `Signed in as ${profileUser.displayName}`
                        : profileUser?.phone
                          ? `Signed in as ******${profileUser.phone.slice(-4)}`
                          : "Signed in"}
                    </p>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--hover-bg)]"
                      onClick={() => { setProfileOpen(false); signOut(); }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button type="button" className="nbtn-ghost" onClick={() => setOpenLoginModal(true)}>
              Sign In
            </button>
          )}
          <Link href="/post-property" className="nbtn-primary">
            Post Free ✦
          </Link>
        </div>
        <button
          type="button"
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>
      <div
        className={`nav-drawer-backdrop ${menuOpen ? "nav-drawer-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div className={`nav-drawer ${menuOpen ? "nav-drawer-open" : ""}`}>
        <div className="nav-drawer-inner">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={activeLabel === label ? "npill active" : "npill"}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
          <Link href="/about" className="npill" onClick={closeMenu}>
            About
          </Link>
          {isAuthenticated ? (
            <button type="button" className="npill" onClick={() => { signOut(); closeMenu(); }}>
              Sign out
            </button>
          ) : (
            <button type="button" className="npill" onClick={() => { setOpenLoginModal(true); closeMenu(); }}>
              Sign In
            </button>
          )}
          <Link href="/post-property" className="nbtn-primary nav-drawer-cta" onClick={closeMenu}>
            Post Free ✦
          </Link>
          <button
            type="button"
            className="npill"
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
      <LoginModal open={openLoginModal} onClose={() => setOpenLoginModal(false)} />
    </>
  );
}
