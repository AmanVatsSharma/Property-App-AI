/**
 * @file ServiceWorkerInit.tsx
 * @module layout
 * @description Client-only SW registration injected into root layout.
 * @author BharatERP
 * @created 2025-03-19
 */

"use client";

import { useEffect } from "react";

export default function ServiceWorkerInit() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
