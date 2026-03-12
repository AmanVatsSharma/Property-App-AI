/**
 * @file page.tsx
 * @module admin/app/(dashboard)
 * @description Dashboard home: stats cards and recent properties placeholder.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { gqlAdminStats, gqlProperties } from "@/lib/graphql-client";

export default function DashboardPage() {
  const [stats, setStats] = useState<{ propertyCount: number; userCount: number } | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; title: string; location: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      gqlAdminStats(token),
      gqlProperties({ limit: 10, offset: 0 }, token),
    ])
      .then(([s, list]) => {
        setStats(s);
        setRecent(list.slice(0, 5));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[var(--admin-muted)]">Loading dashboard…</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-4">
          <p className="text-sm text-[var(--admin-muted)]">Total properties</p>
          <p className="text-2xl font-semibold">{stats?.propertyCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-4">
          <p className="text-sm text-[var(--admin-muted)]">Total users</p>
          <p className="text-2xl font-semibold">{stats?.userCount ?? 0}</p>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium mb-3">Recent properties</h2>
        <ul className="rounded-lg border border-[var(--admin-border)] overflow-hidden">
          {recent.length === 0 ? (
            <li className="p-4 text-[var(--admin-muted)]">No properties yet.</li>
          ) : (
            recent.map((p) => (
              <li
                key={p.id}
                className="border-b border-[var(--admin-border)] last:border-b-0"
              >
                <Link
                  href={`/properties/${p.id}`}
                  className="flex justify-between items-center p-4 hover:bg-[var(--admin-sidebar)]"
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="text-[var(--admin-muted)]">
                    {p.location} · ₹{p.price.toLocaleString()}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/properties"
          className="inline-block mt-2 text-sm text-[var(--admin-accent)] hover:underline"
        >
          View all properties →
        </Link>
      </div>
    </div>
  );
}
