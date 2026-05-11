/**
 * File:        src/components/ui/StatsCard.tsx
 * Module:      Owner Dashboard — UI Components
 * Purpose:     Metric display card with trend indicator
 *
 * Exports:
 *   - StatsCard                       — stat card with icon, value, label, trend
 *
 * Props:
 *   - title: string
 *   - value: string | number
 *   - change?: string (e.g. "+12%")
 *   - trend?: "up" | "down" | "neutral"
 *   - icon?: React.ReactNode
 *   - loading?: boolean
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  loading = false,
}: StatsCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "var(--success)"
      : trend === "down"
      ? "var(--danger)"
      : "var(--text-muted)";

  return (
    <div
      className="rounded-xl border p-5 transition-shadow hover:shadow-lg"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded" style={{ backgroundColor: "var(--border)" }} />
          <div className="h-8 w-32 animate-pulse rounded" style={{ backgroundColor: "var(--border)" }} />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {title}
              </p>
              <p
                className="mt-1 text-2xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </p>
            </div>
            {icon && (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(16,185,129,0.1)" }}
              >
                <span style={{ color: "var(--accent)" }}>{icon}</span>
              </div>
            )}
          </div>

          {change && (
            <div className="mt-3 flex items-center gap-1">
              <TrendIcon className="h-3.5 w-3.5" style={{ color: trendColor }} />
              <span className="text-xs font-medium" style={{ color: trendColor }}>
                {change}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                vs last month
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
