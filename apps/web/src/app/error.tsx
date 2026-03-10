/**
 * @file error.tsx
 * @module app
 * @description Route-level error boundary; shows message and retry
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("ERROR_CAPTURED", error?.message, error?.digest, error?.stack);
  }, [error]);

  return (
    <div className="page-wrap" style={{ padding: "80px 52px", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="card" style={{ maxWidth: 480, padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 className="h2" style={{ marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          We encountered an error. You can try again or return home.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
