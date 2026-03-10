/**
 * @file not-found.tsx
 * @module app
 * @description 404 page when route is not found
 * @author BharatERP
 * @created 2025-03-10
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-wrap" style={{ padding: "80px 52px", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="card" style={{ maxWidth: 480, padding: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
        <h1 className="h2" style={{ marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
