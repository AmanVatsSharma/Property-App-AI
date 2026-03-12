/**
 * @file AdminGuard.tsx
 * @module admin/components
 * @description Protects dashboard routes: requires admin token and role; redirects to login otherwise.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { gqlMe } from "@/lib/graphql-client";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    gqlMe(token)
      .then((user) => {
        if (!user || user.role !== "admin") {
          router.replace("/login");
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--admin-muted)]">Loading…</p>
      </div>
    );
  }
  return <>{children}</>;
}
