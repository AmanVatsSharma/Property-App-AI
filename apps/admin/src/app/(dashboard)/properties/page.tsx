"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { gqlProperties, type ApiProperty } from "@/lib/graphql-client";

export default function PropertiesPage() {
  const [list, setList] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    gqlProperties({ limit, offset }, token)
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [offset]);

  if (loading && list.length === 0) {
    return <p className="text-[var(--admin-muted)]">Loading properties…</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <Link
          href="/properties/new"
          className="rounded px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium hover:bg-[var(--admin-accent-hover)]"
        >
          New property
        </Link>
      </div>
      <div className="rounded-lg border border-[var(--admin-border)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)]">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Location</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Price</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Created</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]" />
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-[var(--admin-muted)]">{p.location}</td>
                <td className="px-4 py-3">₹{Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3 text-sm text-[var(--admin-muted)]">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/properties/${p.id}`}
                    className="text-sm text-[var(--admin-accent)] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - limit))}
          className="rounded px-3 py-1 border border-[var(--admin-border)] text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={list.length < limit}
          onClick={() => setOffset((o) => o + limit)}
          className="rounded px-3 py-1 border border-[var(--admin-border)] text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
