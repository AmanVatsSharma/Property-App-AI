/**
 * File:        src/app/(dashboard)/users/page.tsx
 * Module:      Owner Dashboard — Users Page
 * Purpose:     Users management
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { getUsers } from "@/lib/api-client";
import UserTable from "@/components/users/UserTable";

export default async function UsersPage() {
  const users = await getUsers({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Users
        </h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="broker">Broker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <UserTable users={users.data} total={users.total} />
    </div>
  );
}