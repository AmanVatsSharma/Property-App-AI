/**
 * File:        src/app/(dashboard)/page.tsx
 * Module:      Owner Dashboard — Overview Page
 * Purpose:     Main dashboard with stats cards, AI metrics chart, and activity feed
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getAdminStats } from "@/lib/api-client";
import { StatsCard } from "@/components/ui/StatsCard";
import ActivityFeed from "@/components/ui/ActivityFeed";
import { AIStatsChart } from "@/components/ui/AIStatsChart";

export default async function DashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Dashboard
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Properties"
          value={stats.propertyCount}
          icon="building"
          change={stats.todayNewProperties > 0 ? `+${stats.todayNewProperties} today` : undefined}
        />
        <StatsCard
          title="Total Users"
          value={stats.userCount}
          icon="users"
          change={stats.todayNewUsers > 0 ? `+${stats.todayNewUsers} today` : undefined}
        />
        <StatsCard
          title="Brokers"
          value={stats.brokerCount}
          icon="badge"
          change={stats.pendingBrokers > 0 ? `${stats.pendingBrokers} pending` : undefined}
        />
        <StatsCard
          title="Enquiries"
          value={stats.enquiryCount}
          icon="message"
        />
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIStatsChart
          queriesToday={stats.aiQueriesToday}
          tokenUsage={stats.aiTokenUsageToday}
          avgResponseTime={stats.avgResponseTimeMs}
        />
        <ActivityFeed recentProperties={[]} recentUsers={[]} />
      </div>
    </div>
  );
}