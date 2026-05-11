/**
 * @file PropertyTable.tsx
 * @module owner-dashboard/components/properties
 * @description Property table with pagination
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { formatCurrency } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  status: string;
  createdAt: string | Date;
}

interface PropertyTableProps {
  properties: Property[];
  total: number;
  currentPage: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  rejected: "bg-red-500/10 text-red-500",
  archived: "bg-gray-500/10 text-gray-500",
  featured: "bg-purple-500/10 text-purple-500",
};

export default function PropertyTable({ properties, total, currentPage }: PropertyTableProps) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[hsl(var(--secondary))]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Title</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Location</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Price</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">
                  No properties found
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-[hsl(var(--secondary))]">
                  <td className="px-6 py-4 font-medium">{property.title}</td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{property.location}</td>
                  <td className="px-6 py-4">{formatCurrency(property.price)}</td>
                  <td className="px-6 py-4">{property.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status] || ""}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/properties/${property.id}`} className="text-sm text-[hsl(var(--primary))] hover:underline">
                      Edit
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Showing {properties.length} of {total}
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))]">
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))]">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}