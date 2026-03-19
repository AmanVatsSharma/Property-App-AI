/**
 * @file NotificationBell.tsx
 * @module layout
 * @description Notification bell with unread count and dropdown.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import {
  gqlMyNotifications,
  gqlMarkAllNotificationsRead,
  type NotificationItem,
} from "@/lib/graphql-client";

export default function NotificationBell() {
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useRealtimeNotifications(token);

  const unread = notifications.filter((n) => !n.readAt).length;

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await gqlMyNotifications(headers, 20, 0);
      setNotifications(data);
    } catch {
      // ignore — bell is non-critical
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated) loadNotifications();
  }, [isAuthenticated, loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    await gqlMarkAllNotificationsRead(headers).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="nbtn-ghost"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) loadNotifications();
        }}
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
        style={{ position: "relative", padding: "8px 12px" }}
      >
        🔔
        {unread > 0 && (
          <span
            className="notif-badge"
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--coral)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
            aria-hidden
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 89 }}
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 340,
              background: "var(--dark-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              zIndex: 90,
              overflow: "hidden",
            }}
            role="dialog"
            aria-label="Notifications panel"
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--heading)" }}>
                Notifications
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: 11,
                    color: "var(--teal)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {loading ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🔕</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      background: n.readAt ? "transparent" : "rgba(0,212,170,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.readAt ? 400 : 600,
                        color: "var(--heading)",
                        marginBottom: 3,
                      }}
                    >
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
