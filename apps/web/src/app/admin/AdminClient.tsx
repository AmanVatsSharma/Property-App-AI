/**
 * @file AdminClient.tsx
 * @module app/admin
 * @description Admin panel client: stats, paginated users table, role changes.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { SkeletonText } from "@/components/ui/Skeleton";
import { runGraphQL } from "@property-app-ai/shared";

const GQL_URL = () =>
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_GRAPHQL_HTTP ??
       (process.env.NEXT_PUBLIC_API_URL
         ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/graphql`
         : ""))
    : "";

const Q_ADMIN_STATS = `query { adminStats { propertyCount userCount } }`;
const Q_USERS = `
  query Users($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      users { id phone displayName role createdAt }
      total
    }
  }
`;
const M_SET_ROLE = `
  mutation SetUserRole($userId: String!, $role: UserRole!) {
    setUserRole(userId: $userId, role: $role) { id role }
  }
`;

type UserRole = "user" | "broker" | "admin";

interface AdminStats {
  propertyCount: number;
  userCount: number;
}
interface AdminUser {
  id: string;
  phone: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "var(--coral)",
  broker: "var(--gold)",
  user: "var(--text-muted)",
};

function StatTile({
  icon,
  label,
  value,
  color = "var(--teal)",
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: 24, display: "flex", gap: 16, alignItems: "center" }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${color}18`,
          border: `1px solid ${color}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-playfair,serif)",
            fontSize: 30,
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
      </div>
    </div>
  );
}

export default function AdminClient() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [roleChanging, setRoleChanging] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const url = GQL_URL();

  const load = useCallback(
    async (p: number) => {
      if (!url || !token) return;
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          runGraphQL<{ adminStats: AdminStats }>(url, {
            query: Q_ADMIN_STATS,
            headers,
          }),
          runGraphQL<{ users: { users: AdminUser[]; total: number } }>(url, {
            query: Q_USERS,
            variables: { limit: PAGE_SIZE, offset: p * PAGE_SIZE },
            headers,
          }),
        ]);
        setStats(statsRes.adminStats);
        setUsers(usersRes.users.users);
        setTotal(usersRes.users.total);
      } catch (e) {
        showToast(
          e instanceof Error ? e.message : "Failed to load admin data",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [url, token, showToast]
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (!url) return;
    setRoleChanging(userId);
    try {
      await runGraphQL(url, {
        query: M_SET_ROLE,
        variables: { userId, role },
        headers,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      showToast("Role updated", "success");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to update role",
        "error"
      );
    } finally {
      setRoleChanging(null);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: "48px 52px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>
          Sign in with an admin account.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 52px 80px" }}>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 16,
          marginBottom: 32,
        }}
        data-testid="admin-stats"
      >
        {loading && !stats ? (
          [1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <SkeletonText width="50%" height={28} />
              <SkeletonText width="70%" height={12} />
            </div>
          ))
        ) : stats ? (
          <>
            <StatTile
              icon="🏠"
              label="Total properties"
              value={stats.propertyCount.toLocaleString()}
            />
            <StatTile
              icon="👥"
              label="Total users"
              value={stats.userCount.toLocaleString()}
              color="var(--gold)"
            />
          </>
        ) : null}
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow: "hidden" }} data-testid="users-table">
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--heading)",
              }}
            >
              Users
            </div>
            {total > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {total.toLocaleString()} total
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="btn-ghost-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Prev
            </button>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                padding: "7px 10px",
              }}
            >
              Page {page + 1}
            </span>
            <button
              type="button"
              className="btn-ghost-sm"
              disabled={(page + 1) * PAGE_SIZE >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Phone", "Name", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: "12px 16px" }}>
                        <SkeletonText
                          width={
                            j === 0 ? "80%" : j === 4 ? "60%" : "50%"
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--dark-3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      +91 ****{u.phone.slice(-4)}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {u.displayName ?? (
                        <span
                          style={{
                            color: "var(--text-dim)",
                            fontStyle: "italic",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: 100,
                          fontSize: 11,
                          fontWeight: 700,
                          background: `${ROLE_COLORS[u.role] ?? "var(--text-muted)"}18`,
                          border: `1px solid ${ROLE_COLORS[u.role] ?? "var(--border)"}30`,
                          color: ROLE_COLORS[u.role] ?? "var(--text-muted)",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--text-dim)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        className="select"
                        style={{
                          fontSize: 12,
                          padding: "6px 10px",
                          width: "auto",
                          minWidth: 120,
                        }}
                        value={u.role}
                        disabled={roleChanging === u.id}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as UserRole)
                        }
                        aria-label={`Change role for ${u.phone}`}
                      >
                        <option value="user">user</option>
                        <option value="broker">broker</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
