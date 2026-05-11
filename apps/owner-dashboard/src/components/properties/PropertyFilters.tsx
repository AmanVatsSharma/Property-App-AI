/**
 * @file PropertyFilters.tsx
 * @module owner-dashboard/components/properties
 * @description Property filters component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (location) params.set("location", location);
    router.push(`/properties?${params}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="archived">Archived</option>
        <option value="featured">Featured</option>
      </select>

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Filter by location..."
        className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
      />

      <button
        onClick={applyFilters}
        className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90"
      >
        Apply Filters
      </button>
    </div>
  );
}