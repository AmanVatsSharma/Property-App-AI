/**
 * @file ActivityFeed.tsx
 * @module owner-dashboard/components/ui
 * @description Activity feed component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

interface ActivityItem {
  id: string;
  type: "property" | "user" | "enquiry";
  title: string;
  description: string;
  time: string;
}

interface ActivityFeedProps {
  recentProperties: ActivityItem[];
  recentUsers: ActivityItem[];
}

export default function ActivityFeed({ recentProperties, recentUsers }: ActivityFeedProps) {
  const allActivity = [
    ...recentProperties.map(p => ({ ...p, type: "property" as const })),
    ...recentUsers.map(u => ({ ...u, type: "user" as const })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return (
    <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {allActivity.length > 0 ? (
          allActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === "property"
                    ? "bg-blue-500"
                    : activity.type === "user"
                    ? "bg-green-500"
                    : "bg-purple-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {activity.title}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {activity.description}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}