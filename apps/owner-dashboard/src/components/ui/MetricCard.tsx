/**
 * @file MetricCard.tsx
 * @module owner-dashboard/components/ui
 * @description Metric card for AI dashboard
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { Bot, Cpu, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: "bot" | "cpu" | "clock" | "alert";
  trend?: string;
}

const icons = {
  bot: Bot,
  cpu: Cpu,
  clock: Clock,
  alert: AlertTriangle,
};

export default function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  const Icon = icons[icon];

  return (
    <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[hsl(var(--primary))]/10">
          <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
          <p className="text-xl font-semibold text-[hsl(var(--foreground))]">{value}</p>
          {trend && <p className="text-xs text-green-500">{trend}</p>}
        </div>
      </div>
    </div>
  );
}