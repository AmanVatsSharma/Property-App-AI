/**
 * @file NotificationBell.tsx
 * @module layout
 * @description Notification bell with unread count and dropdown.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  gqlMyNotifications,
  gqlMarkAllNotificationsRead,
  type NotificationItem,
} from "@/lib/graphql-client";
import { useToast } from "@/components/ui/Toast";

export default function NotificationBell() {
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* Real-time: listen for push notifications and prepend to list */
  useEffect(() => {
    if (!token) return;

    const wsUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    if (!wsUrl) return;

    let mounted = true;
    let socket: { disconnect: () => void } | null = null;

    (async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!mounted) return;

        socket = io(`${wsUrl}/notifications`, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnectionAttempts: 3,
          reconnectionDelay: 3000,
          timeout: 5000,
        }) as typeof socket;

        socket.on("notification", (payload: { id: string; type: string; title: string; body: string; createdAt: string }) => {
          if (!mounted) return;
          showToast(payload.body, "info");
          setNotifications((prev) => [
            { id: payload.id, title: payload.title, body: payload.body, readAt: null, createdAt: payload.createdAt ?? new Date().toISOString() },
            ...prev,
          ]);
        });
      } catch {
        // socket.io-client not installed — silently skip
      }
    })();

    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, [token, showToast]);

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

  const handleMarkOneRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n),
    );
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
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <a
                  href="/notifications"
                  style={{ fontSize: 11, color: "var(--teal)", textDecoration: "none", fontWeight: 600 }}
                >
                  View all
                </a>
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
                    role="button"
                    tabIndex={0}
                    onClick={() => handleMarkOneRead(n.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleMarkOneRead(n.id); }}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      background: n.readAt ? "transparent" : "rgba(0,212,170,0.04)",
                      cursor: "pointer",
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
