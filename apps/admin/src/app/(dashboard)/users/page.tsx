/**
 * @file page.tsx
 * @module admin/app/(dashboard)/users
 * @description Users list: API-sourced via gqlUsers with token; empty and error states handled.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { gqlUsers, type AdminUser } from "@/lib/graphql-client";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    gqlUsers(token, limit, offset)
      .then(({ users: u, total: t }) => {
        setUsers(u);
        setTotal(t);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [offset]);

  if (loading && users.length === 0) {
    return (
      <p className="text-[var(--admin-muted)]" data-testid="users-loading">
        Loading users…
      </p>
    );
  }

  if (error) {
    return (
      <div data-testid="users-error">
        <p className="text-red-400">{error}</p>
        <Link href="/login" className="mt-2 inline-block text-sm text-[var(--admin-accent)] hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="users-page">
      <h1 className="text-2xl font-semibold">Users</h1>
      {users.length === 0 ? (
        <div
          className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-8 text-center"
          data-testid="users-empty"
        >
          <p className="text-[var(--admin-muted)]">No users found.</p>
        </div>
      ) : (
      <div className="rounded-lg border border-[var(--admin-border)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)]">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Phone</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Display name</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Role</th>
              <th className="px-4 py-3 text-sm font-medium text-[var(--admin-muted)]">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                <td className="px-4 py-3 font-medium">{u.phone}</td>
                <td className="px-4 py-3 text-[var(--admin-muted)]">{u.displayName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-[var(--admin-accent)]/20 text-[var(--admin-accent)]"
                        : "bg-[var(--admin-border)] text-[var(--admin-muted)]"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--admin-muted)]">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {users.length > 0 && (
        <>
          <p className="text-sm text-[var(--admin-muted)]">Total: {total}</p>
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
              disabled={offset + users.length >= total}
              onClick={() => setOffset((o) => o + limit)}
              className="rounded px-3 py-1 border border-[var(--admin-border)] text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
