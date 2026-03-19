/**
 * @file ProfileClient.tsx
 * @module app/profile
 * @description User profile management — display name, saved searches link, sign out.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { gqlMe, gqlUpdateProfile, type AuthUser } from "@/lib/graphql-client";

export default function ProfileClient() {
  const { token, isAuthenticated, signOut, setOpenLoginModal } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    gqlMe(headers)
      .then((u) => {
        if (u) {
          setUser(u);
          setDisplayName(u.displayName ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const updated = await gqlUpdateProfile(
        { displayName: displayName.trim() || null },
        headers
      );
      setUser(updated);
      showToast("Profile updated", "success");
    } catch {
      showToast("Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "48px 52px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
          Sign in to manage your profile.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setOpenLoginModal(true)}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 52px 80px", maxWidth: 560 }}>
      {loading ? (
        <div className="loading-spinner" style={{ margin: "40px auto" }} />
      ) : (
        <>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Account
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--teal), #00a884)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {user?.displayName?.[0]?.toUpperCase() ?? "👤"}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--heading)",
                  }}
                >
                  {user?.displayName ?? "Unnamed User"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  +91 ****{user?.phone?.slice(-4)}
                </div>
                <span
                  className="badge badge-teal"
                  style={{ marginTop: 6, fontSize: 10 }}
                >
                  Verified ✓
                </span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <label className="label" htmlFor="displayName">
                Display Name
              </label>
              <input
                id="displayName"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={200}
                style={{ marginTop: 6, marginBottom: 16 }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ padding: "11px 24px" }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              My Activity
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { href: "/favorites", icon: "♡", label: "Saved Properties" },
                {
                  href: "/saved-searches",
                  icon: "🔔",
                  label: "Saved Searches & Alerts",
                },
                { href: "/broker", icon: "🏢", label: "Broker Dashboard" },
              ].map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 8px",
                    borderRadius: 10,
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                  className="hover:text-[var(--teal)] hover:bg-[var(--teal-dim)]"
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  {label}
                  <span style={{ marginLeft: "auto", opacity: 0.4 }}>›</span>
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            style={{
              background: "none",
              border: "1px solid rgba(255,107,74,0.3)",
              borderRadius: 12,
              padding: "11px 24px",
              color: "var(--coral)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
            }}
          >
            Sign out
          </button>
        </>
      )}
    </div>
  );
}
