/**
 * File:        src/app/(dashboard)/enquiries/page.tsx
 * Module:      Owner Dashboard — Enquiries Page
 * Purpose:     Enquiry management
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getEnquiries } from "@/lib/api-client";
import EnquiryTable from "@/components/enquiries/EnquiryTable";

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Enquiries
        </h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <EnquiryTable enquiries={enquiries.data} total={enquiries.total} />
    </div>
  );
}