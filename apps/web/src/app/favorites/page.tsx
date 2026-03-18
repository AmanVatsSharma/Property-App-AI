/**
 * @file page.tsx
 * @module app/favorites
 * @description My Favorites page; lists saved properties (auth required).
 * @author BharatERP
 * @created 2026-03-18
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { gqlMyFavorites, type FavoriteWithProperty } from "@/lib/graphql-client";

export default function FavoritesPage() {
  const { token } = useAuth();
  const [list, setList] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setList([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    gqlMyFavorites({ Authorization: `Bearer ${token}` })
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  if (!token) {
    return (
      <div className="page-wrap" style={{ padding: 48, textAlign: "center" }}>
        <h1 className="text-2xl font-bold text-white mb-4">My Favorites</h1>
        <p className="text-[var(--text-muted)]">Sign in to see your saved properties.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrap" style={{ padding: 48, textAlign: "center" }}>
        <h1 className="text-2xl font-bold text-white mb-4">My Favorites</h1>
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap" style={{ padding: 48, textAlign: "center" }}>
        <h1 className="text-2xl font-bold text-white mb-4">My Favorites</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ padding: "24px 48px 48px" }}>
      <h1 className="text-2xl font-bold text-white mb-6">My Favorites</h1>
      {list.length === 0 ? (
        <p className="text-[var(--text-muted)]">No saved properties. Save listings from search or property pages.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((fav) => (
            <li key={fav.id}>
              <Link
                href={`/property/${fav.propertyId}`}
                className="block rounded-xl bg-[var(--dark-2)] border border-[var(--border)] p-4 hover:border-[var(--teal)]/50 transition-colors"
              >
                <div className="font-semibold text-white">{fav.property?.title ?? "Property"}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{fav.property?.location}</div>
                {fav.property?.price != null && (
                  <div className="text-[var(--teal)] mt-1">
                    ₹{(fav.property.price / 1_00_000).toFixed(0)} L+
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
