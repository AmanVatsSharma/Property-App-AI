/**
 * @file AnalyticsChart.tsx
 * @module owner-dashboard/components/ui
 * @description Reusable analytics chart component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsChartProps {
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
  type: "bar" | "pie";
}

const COLORS = ["hsl(var(--primary))", "hsl(262 83% 48%)", "hsl(262 83% 38%)", "hsl(262 83% 28%)"];

export default function AnalyticsChart({ title, description, data, type }: AnalyticsChartProps) {
  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{description}</p>

      <div className="h-64">
        {type === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}