/**
 * @file BrokerTable.tsx
 * @module owner-dashboard/components/brokers
 * @description Broker verification table
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

interface Broker {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  reraId?: string;
  status: string;
  createdAt: string | Date;
}

interface BrokerTableProps {
  brokers: Broker[];
  total: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  suspended: "bg-gray-500/10 text-gray-500",
};

export default function BrokerTable({ brokers, total }: BrokerTableProps) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[hsl(var(--secondary))]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Phone</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">RERA ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {brokers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">
                  No brokers found
                </td>
              </tr>
            ) : (
              brokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-[hsl(var(--secondary))]">
                  <td className="px-6 py-4 font-medium">{broker.name}</td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{broker.phone}</td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{broker.email || "—"}</td>
                  <td className="px-6 py-4">{broker.reraId || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[broker.status] || ""}`}>
                      {broker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-sm text-green-500 hover:underline">Approve</button>
                    <button className="text-sm text-red-500 hover:underline">Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[hsl(var(--border))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total: {total} brokers</p>
      </div>
    </div>
  );
}