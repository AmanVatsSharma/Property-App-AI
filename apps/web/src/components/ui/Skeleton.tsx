/**
 * @file Skeleton.tsx
 * @module ui
 * @description Skeleton loading placeholders for async content.
 * @author BharatERP
 * @created 2025-03-19
 */

export function SkeletonCard() {
  return (
    <div className="prop-card-v2" aria-hidden>
      <div className="card-img-wrap skeleton skeleton-img" style={{ aspectRatio: "4/3" }} />
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton skeleton-title" style={{ width: "70%" }} />
        <div className="skeleton skeleton-text" style={{ width: "50%" }} />
        <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div className="skeleton skeleton-text" style={{ width: 48 }} />
          <div className="skeleton skeleton-text" style={{ width: 48 }} />
          <div className="skeleton skeleton-text" style={{ width: 64 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="prop-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({
  width = "100%",
  height = 14,
}: {
  width?: string | number;
  height?: number;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 4 }}
      aria-hidden
    />
  );
}
