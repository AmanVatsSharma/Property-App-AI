/**
 * @file layout.tsx
 * @module admin/app/(dashboard)
 * @description Dashboard layout: AdminGuard + sidebar + main content.
 * @author BharatERP
 * @created 2025-03-13
 */

import AdminGuard from "@/components/AdminGuard";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </AdminGuard>
  );
}
