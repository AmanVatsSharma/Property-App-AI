/**
 * File:        src/components/ui/AIStatsChart.tsx
 * Module:      Owner Dashboard — UI Components
 * Purpose:     AI usage stats card with a mini line chart
 *
 * Exports:
 *   - AIStatsChart             — named export for dashboard overview
 *   - default AIStatsChartDefault — default export (same component)
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AIStatsChartProps {
  queriesToday: number;
  tokenUsage: number;
  avgResponseTime: number;
}

function AIStatsChartDefault({ queriesToday, tokenUsage, avgResponseTime }: AIStatsChartProps) {
  const data = [
    { time: "00:00", queries: 2 },
    { time: "04:00", queries: 1 },
    { time: "08:00", queries: 8 },
    { time: "12:00", queries: 15 },
    { time: "16:00", queries: 12 },
    { time: "20:00", queries: 6 },
  ];

  return (
    <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      <h3 className="text-lg font-semibold mb-4">AI Usage Today</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Queries</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>{queriesToday}</p>
        </div>
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Tokens</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>{tokenUsage.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Avg Response</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>{avgResponseTime}ms</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { AIStatsChartDefault as AIStatsChart };
export default AIStatsChartDefault;