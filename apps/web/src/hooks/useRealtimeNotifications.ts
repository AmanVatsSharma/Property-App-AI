/**
 * @file useRealtimeNotifications.ts
 * @module hooks
 * @description Hook to connect to WS notification gateway and surface real-time alerts.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
}

export function useRealtimeNotifications(token: string | null) {
  const { showToast } = useToast();
  const socketRef = useRef<ReturnType<typeof import("socket.io-client").io> | null>(
    null,
  );

  const connect = useCallback(async () => {
    if (!token) return;
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
    if (!wsUrl) return;

    const { io } = await import("socket.io-client");
    const socket = io(`${wsUrl}/notifications`, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("notification", (payload: NotificationPayload) => {
      showToast(payload.body, "info");
    });

    socket.on("connect_error", () => {
      // Silently fail — WS is enhancement only
    });

    socketRef.current = socket;
  }, [token, showToast]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connect]);
}
