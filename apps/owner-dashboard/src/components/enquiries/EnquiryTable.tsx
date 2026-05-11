/**
 * @file EnquiryTable.tsx
 * @module owner-dashboard/components/enquiries
 * @description Enquiry table component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: string;
  propertyId?: string;
  createdAt: string | Date;
}

interface EnquiryTableProps {
  enquiries: Enquiry[];
  total: number;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  converted: "bg-green-500/10 text-green-500",
  closed: "bg-gray-500/10 text-gray-500",
};

export default function EnquiryTable({ enquiries, total }: EnquiryTableProps) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[hsl(var(--secondary))]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Phone</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Message</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Date</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">
                  No enquiries found
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="hover:bg-[hsl(var(--secondary))]">
                  <td className="px-6 py-4 font-medium">{enquiry.name}</td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{enquiry.phone}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{enquiry.message}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[enquiry.status] || ""}`}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-[hsl(var(--primary))] hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[hsl(var(--border))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total: {total} enquiries</p>
      </div>
    </div>
  );
}