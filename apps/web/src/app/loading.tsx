/**
 * @file loading.tsx
 * @module app
 * @description Route-level loading UI (suspense fallback)
 * @author BharatERP
 * @created 2025-03-10
 */

export default function Loading() {
  return (
    <div className="page-wrap" style={{ padding: "80px 52px", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div className="loading-spinner" aria-hidden />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading…</p>
      </div>
    </div>
  );
}
