/**
 * @file NotificationBell.tsx
 * @module layout
 * @description Notification bell with unread count badge and dropdown panel.
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

  useRealtimeNotifications(token);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const unread = notifications.filter((n) => !n.readAt).length;

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await gqlMyNotifications(
        headers as Record<string, string>,
        20,
        0,
      );
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) loadNotifications();
  }, [isAuthenticated, loadNotifications]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await gqlMarkAllNotificationsRead(headers as Record<string, string>);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() })),
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="nbtn-ghost"
        onClick={handleOpen}
        aria-label={
          unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
        }
        style={{ position: "relative", padding: "8px 12px" }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              paddingLeft: unread > 9 ? 4 : 0,
              paddingRight: unread > 9 ? 4 : 0,
              borderRadius: 999,
              background: "var(--coral)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
              lineHeight: 1,
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
            className="fixed inset-0 z-[89]"
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
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--heading)",
                }}
              >
                Notifications
              </span>
              {unread > 0 && (
                <button
                  type="button"
                  style={{
                    fontSize: 11,
                    color: "var(--teal)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
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
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      background: n.readAt
                        ? "transparent"
                        : "rgba(0,212,170,0.04)",
                      cursor: "default",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.readAt ? 400 : 600,
                        color: "var(--heading)",
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {n.body}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-dim)",
                        marginTop: 4,
                      }}
                    >
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
