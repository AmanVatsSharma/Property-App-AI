/**
 * File:        src/components/ui/TokenUsageChart.tsx
 * Module:      Owner Dashboard — UI Components
 * Purpose:     Bar chart for AI token/query usage over time
 *
 * Exports:
 *   - TokenUsageChart        — named export
 *   - default TokenUsageChart — default export
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TokenUsageChartProps {
  /** Accepts multiple shapes that the API may return. */
  data: Array<{
    date: string;
    count?: number;
    tokens?: number;
    queryCount?: number;
    tokenCount?: number;
  }>;
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = data.map(d => ({
    date: d.date,
    count: d.count ?? d.queryCount ?? 0,
    tokens: d.tokens ?? d.tokenCount ?? 0,
  }));

  return (
    <div className="h-48">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-[hsl(var(--muted-foreground))]">No data available</p>
        </div>
      )}
    </div>
  );
}

export default TokenUsageChart;