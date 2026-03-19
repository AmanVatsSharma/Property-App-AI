/**
 * @file useRealtimeNotifications.ts
 * @module hooks
 * @description WebSocket real-time notification hook (gracefully degrades).
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
}

export function useRealtimeNotifications(token: string | null) {
  const { showToast } = useToast();
  const socketRef = useRef<{ disconnect: () => void } | null>(null);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (!token) return;

    const wsUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    if (!wsUrl) return;

    let mounted = true;

    (async () => {
      try {
        const { io } = await import("socket.io-client");
        if (!mounted) return;

        const socket = io(`${wsUrl}/notifications`, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnectionAttempts: 3,
          reconnectionDelay: 3000,
          timeout: 5000,
        });

        socket.on("notification", (payload: NotificationPayload) => {
          if (mounted) showToastRef.current(payload.body, "info");
        });

        socket.on("connect_error", () => {});
        socket.on("error", () => {});

        socketRef.current = socket;
      } catch {
        // socket.io-client not installed — silently skip
      }
    })();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token]);
}
