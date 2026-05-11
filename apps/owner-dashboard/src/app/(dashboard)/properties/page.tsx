/**
 * File:        src/app/(dashboard)/properties/page.tsx
 * Module:      Owner Dashboard — Properties Page
 * Purpose:     Properties management with server-side filtering
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getProperties } from "@/lib/api-client";
import PropertyTable from "@/components/properties/PropertyTable";
import PropertyFilters from "@/components/properties/PropertyFilters";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const filters = {
    page,
    limit: 20,
    status: params.status as string | undefined,
    city: params.location as string | undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  };

  const properties = await getProperties(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Properties
        </h1>
      </div>

      <PropertyFilters />

      <PropertyTable
        properties={properties.data}
        total={properties.total}
        currentPage={properties.page}
      />
    </div>
  );
}