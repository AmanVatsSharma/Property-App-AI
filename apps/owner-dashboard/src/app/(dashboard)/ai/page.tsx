/**
 * File:        src/app/(dashboard)/ai/page.tsx
 * Module:      Owner Dashboard — AI Page
 * Purpose:     AI agent performance monitoring
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getAIMetrics } from "@/lib/api-client";
import MetricCard from "@/components/ui/MetricCard";
import TokenUsageChart from "@/components/ui/TokenUsageChart";

export default async function AIPage() {
  const metrics = await getAIMetrics({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          AI Agent Monitor
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Monitor AI agent performance, usage, and costs
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Queries" value={metrics.totalQueries} icon="bot" />
        <MetricCard
          label="Total Tokens"
          value={metrics.totalTokens.toLocaleString()}
          icon="cpu"
        />
        <MetricCard
          label="Avg Response Time"
          value={`${metrics.avgResponseTimeMs.toFixed(0)}ms`}
          icon="clock"
        />
        <MetricCard
          label="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(2)}%`}
          icon="alert"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-lg font-semibold mb-4">Queries by Day</h3>
          <TokenUsageChart data={metrics.queriesByDay} />
        </div>

        <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-lg font-semibold mb-4">Top Tools Used</h3>
          <div className="space-y-3">
            {metrics.topTools.length > 0 ? (
              metrics.topTools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">{tool.tool}</span>
                  <span className="font-semibold">{tool.callCount}</span>
                </div>
              ))
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Cost by Provider */}
      <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <h3 className="text-lg font-semibold mb-4">Cost by Provider</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "hsl(var(--border))" }}>
                <th className="text-left py-3 px-4">Provider</th>
                <th className="text-right py-3 px-4">Tokens</th>
                <th className="text-right py-3 px-4">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {metrics.costByProvider.length > 0 ? (
                metrics.costByProvider.map((row, i) => (
                  <tr key={i} className="border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
                    <td className="py-3 px-4 capitalize">{row.provider}</td>
                    <td className="py-3 px-4 text-right">{row.tokens.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">${row.costUsd.toFixed(4)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-[hsl(var(--muted-foreground))]">
                    No cost data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}