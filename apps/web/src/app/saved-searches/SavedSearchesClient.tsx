/**
 * @file SavedSearchesClient.tsx
 * @module app/saved-searches
 * @description Client component for saved searches list, alert toggles, and delete.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import {
  gqlMySavedSearches,
  gqlDeleteSavedSearch,
  gqlUpdateSavedSearch,
  type SavedSearchItem,
} from "@/lib/graphql-client";
import { SkeletonText } from "@/components/ui/Skeleton";

function AlertToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 100,
        border: `1px solid ${enabled ? "rgba(0,212,170,0.3)" : "var(--border)"}`,
        background: enabled ? "var(--teal-dim)" : "var(--glass)",
        color: enabled ? "var(--teal)" : "var(--text-muted)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      aria-pressed={enabled}
    >
      {enabled ? "🔔 Alerts on" : "🔕 Alerts off"}
    </button>
  );
}

function FilterSummary({ filters }: { filters: Record<string, unknown> }) {
  const parts: string[] = [];
  if (filters.location) parts.push(String(filters.location));
  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.maxPrice)
    parts.push(`under ₹${Number(filters.maxPrice).toLocaleString("en-IN")}`);
  if (filters.type) parts.push(String(filters.type));
  return (
    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
      {parts.length > 0 ? parts.join(" · ") : "All properties"}
    </div>
  );
}

export default function SavedSearchesClient() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [searches, setSearches] = useState<SavedSearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    gqlMySavedSearches(headers)
      .then((data) => {
        if (!cancelled) setSearches(data);
      })
      .catch(() => {
        if (!cancelled) showToast("Failed to load saved searches", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, showToast]);

  const handleToggleAlert = async (item: SavedSearchItem) => {
    try {
      const updated = await gqlUpdateSavedSearch(
        item.id,
        { alertEnabled: !item.alertEnabled },
        headers,
      );
      setSearches((prev) =>
        prev.map((s) => (s.id === item.id ? updated : s)),
      );
      showToast(
        updated.alertEnabled ? "Alerts enabled" : "Alerts disabled",
        "success",
      );
    } catch {
      showToast("Could not update alert", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await gqlDeleteSavedSearch(id, headers);
      setSearches((prev) => prev.filter((s) => s.id !== id));
      showToast("Saved search deleted", "info");
    } catch {
      showToast("Could not delete", "error");
    }
  };

  if (!token) {
    return (
      <div style={{ padding: "40px 52px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>
          Sign in to manage your saved searches.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 52px 64px" }}>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <SkeletonText width="40%" height={18} />
              <SkeletonText width="60%" height={13} />
            </div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            background: "var(--dark-2)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 className="h3" style={{ marginBottom: 8 }}>
            No saved searches yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Save a search from the search page to get notified when new
            properties match.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {searches.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--heading)",
                    fontSize: 15,
                  }}
                >
                  {item.name}
                </div>
                <FilterSummary filters={item.filters} />
                {item.lastAlertSentAt && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      marginTop: 4,
                    }}
                  >
                    Last alert:{" "}
                    {new Date(item.lastAlertSentAt).toLocaleDateString("en-IN")}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertToggle
                  enabled={item.alertEnabled}
                  onChange={() => handleToggleAlert(item)}
                />
                <button
                  type="button"
                  className="btn-ghost-sm"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete saved search"
                  style={{ color: "var(--coral)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
