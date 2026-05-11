/**
 * @file UserTable.tsx
 * @module owner-dashboard/components/users
 * @description User table component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  createdAt: string | Date;
  verified: boolean;
}

interface UserTableProps {
  users: User[];
  total: number;
}

const roleColors: Record<string, string> = {
  user: "bg-gray-500/10 text-gray-500",
  broker: "bg-blue-500/10 text-blue-500",
  admin: "bg-purple-500/10 text-purple-500",
};

export default function UserTable({ users, total }: UserTableProps) {
  return (
    <div className="rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[hsl(var(--secondary))]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Phone</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Verified</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Joined</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[hsl(var(--muted-foreground))]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[hsl(var(--secondary))]">
                  <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || ""}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <span className="text-green-500">Verified</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-[hsl(var(--primary))] hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[hsl(var(--border))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Total: {total} users</p>
      </div>
    </div>
  );
}