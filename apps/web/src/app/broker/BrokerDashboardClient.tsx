/**
 * @file BrokerDashboardClient.tsx
 * @module app/broker
 * @description Broker dashboard — listings, enquiries, verification status.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { SkeletonText } from "@/components/ui/Skeleton";
import {
  gqlMyListings,
  gqlMyReceivedEnquiries,
  gqlMe,
  type ApiProperty,
  type EnquiryItem,
  type AuthUser,
} from "@/lib/graphql-client";

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "var(--teal)",
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: 28,
            fontWeight: 700,
            color,
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {label}
        </div>
        {sub && (
          <div
            style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

type Tab = "listings" | "enquiries" | "verify";

export default function BrokerDashboardClient() {
  const { token, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("listings");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [listings, setListings] = useState<ApiProperty[]>([]);
  const [received, setReceived] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      gqlMe(headers).catch(() => null),
      gqlMyListings(headers, 50, 0).catch(() => []),
      gqlMyReceivedEnquiries(headers).catch(() => []),
    ])
      .then(([me, props, enqs]) => {
        setUser(me ?? null);
        setListings(props);
        setReceived(enqs);
      })
      .catch(() => {
        showToast("Failed to load dashboard data", "error");
      })
      .finally(() => setLoading(false));
  }, [token, showToast]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: "48px 52px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          Sign in to access the broker dashboard.
        </p>
      </div>
    );
  }

  const openEnquiries = received.filter((e) => e.status === "open").length;
  const totalViews = listings.reduce(
    (s, p) => s + (p.viewCount ?? 0),
    0,
  );

  return (
    <div style={{ padding: "32px 52px 80px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <SkeletonText width="60%" height={28} />
              <SkeletonText width="80%" height={12} />
            </div>
          ))
        ) : (
          <>
            <StatCard icon="🏠" label="Active listings" value={listings.length} />
            <StatCard
              icon="📩"
              label="Open enquiries"
              value={openEnquiries}
              color="var(--gold)"
            />
            <StatCard
              icon="👁"
              label="Total views"
              value={totalViews}
              color="var(--coral)"
            />
            <StatCard
              icon="⭐"
              label="Broker status"
              value={user?.role === "broker" ? "Verified" : "Unverified"}
              sub={
                user?.role !== "broker" ? "Apply for verification →" : undefined
              }
              color={
                user?.role === "broker" ? "var(--teal)" : "var(--text-muted)"
              }
            />
          </>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {(["listings", "enquiries", "verify"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "listings"
              ? "My Listings"
              : t === "enquiries"
                ? "Enquiries"
                : "Verification"}
          </button>
        ))}
      </div>

      {tab === "listings" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 className="h3">My Listings</h3>
            <Link
              href="/post-property"
              className="btn-primary"
              style={{
                padding: "10px 20px",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              + New listing
            </Link>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: 18 }}>
                  <SkeletonText width="50%" height={16} />
                  <SkeletonText width="30%" height={12} />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div
              className="card"
              style={{ padding: 40, textAlign: "center" }}
            >
              <p style={{ color: "var(--text-muted)" }}>No listings yet.</p>
              <Link
                href="/post-property"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  padding: "11px 24px",
                  textDecoration: "none",
                }}
              >
                Post your first listing
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {listings.map((p) => (
                <Link
                  key={p.id}
                  href={`/property/${p.id}`}
                  className="card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--heading)",
                        fontSize: 14,
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {p.location}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--teal)",
                          fontSize: 15,
                        }}
                      >
                        ₹{(p.price / 1_00_000).toFixed(0)}L
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--text-dim)" }}
                      >
                        {p.status ?? "active"}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        p.aiScore && p.aiScore >= 80
                          ? "badge-teal"
                          : "badge-white"
                      }`}
                    >
                      AI {p.aiScore ?? "—"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "enquiries" && (
        <div>
          <h3 className="h3" style={{ marginBottom: 16 }}>
            Received Enquiries
          </h3>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2].map((i) => (
                <div key={i} className="card" style={{ padding: 18 }}>
                  <SkeletonText width="70%" />
                </div>
              ))}
            </div>
          ) : received.length === 0 ? (
            <div
              className="card"
              style={{ padding: 40, textAlign: "center" }}
            >
              <p style={{ color: "var(--text-muted)" }}>No enquiries yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {received.map((e) => (
                <div
                  key={e.id}
                  className="card"
                  style={{ padding: "16px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text)",
                          lineHeight: 1.5,
                        }}
                      >
                        {e.message}
                      </div>
                      {e.phone && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--teal)",
                            marginTop: 4,
                          }}
                        >
                          📞 {e.phone}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-dim)",
                          marginTop: 4,
                        }}
                      >
                        {new Date(e.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        e.status === "open" ? "badge-gold" : "badge-white"
                      }`}
                      style={{ marginLeft: 12, flexShrink: 0 }}
                    >
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "verify" && (
        <div style={{ maxWidth: 560 }}>
          <h3 className="h3" style={{ marginBottom: 16 }}>
            Broker Verification
          </h3>
          {user?.role === "broker" ? (
            <div
              className="card"
              style={{
                padding: 32,
                background: "var(--teal-dim)",
                border: "1px solid rgba(0,212,170,0.2)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3
                className="h3"
                style={{ color: "var(--teal)", marginBottom: 8 }}
              >
                Verified Broker
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Your broker status is verified. You have access to all broker
                features.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 28 }}>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  marginBottom: 20,
                  lineHeight: 1.7,
                }}
              >
                Get verified as a broker to unlock priority listing placement,
                verified badge, bulk listing tools, and advanced analytics.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  marginBottom: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  "Verified broker badge on all listings",
                  "Priority search placement",
                  "Bulk listing management tools",
                  "Advanced enquiry analytics",
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span style={{ color: "var(--teal)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: 13 }}
              >
                Apply for Verification
              </button>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                Verification typically takes 24–48 hours
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
