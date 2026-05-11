/**
 * File:        src/app/(dashboard)/brokers/page.tsx
 * Module:      Owner Dashboard — Brokers Page
 * Purpose:     Broker verification management
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getBrokers } from "@/lib/api-client";
import BrokerTable from "@/components/brokers/BrokerTable";

export default async function BrokersPage() {
  const brokers = await getBrokers({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Broker Verification
        </h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <BrokerTable brokers={brokers.data} total={brokers.total} />
    </div>
  );
}