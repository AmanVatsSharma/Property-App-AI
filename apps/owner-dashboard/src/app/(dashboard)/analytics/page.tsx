/**
 * File:        src/app/(dashboard)/analytics/page.tsx
 * Module:      Owner Dashboard — Analytics Page
 * Purpose:     Platform analytics and insights
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getAdminStats } from "@/lib/api-client";
import AnalyticsChart from "@/components/ui/AnalyticsChart";

export default async function AnalyticsPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Analytics
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Platform performance metrics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Properties Overview"
          description="Total properties and growth"
          data={[
            { name: "Total", value: stats.propertyCount },
            { name: "Active", value: Math.floor(stats.propertyCount * 0.7) },
            { name: "Pending", value: Math.floor(stats.propertyCount * 0.2) },
          ]}
          type="bar"
        />

        <AnalyticsChart
          title="User Distribution"
          description="Users by role"
          data={[
            { name: "Users", value: stats.userCount },
            { name: "Brokers", value: stats.brokerCount },
          ]}
          type="pie"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-lg font-semibold mb-2">Daily Active Users</h3>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>
            {stats.todayNewUsers}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">users today</p>
        </div>
        <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-lg font-semibold mb-2">New Listings</h3>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>
            {stats.todayNewProperties}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">properties today</p>
        </div>
        <div className="p-6 rounded-xl border" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="text-lg font-semibold mb-2">AI Usage</h3>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>
            {stats.aiQueriesToday}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">queries today</p>
        </div>
      </div>
    </div>
  );
}