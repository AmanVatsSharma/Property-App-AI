/**
 * @file AdminGuard.tsx
 * @module admin/components
 * @description Protects dashboard routes: reads the admin httpOnly cookie via /api/auth/me,
 *   verifies the user has the admin role via GraphQL, and redirects to login otherwise.
 * @author BharatERP
 * @created 2025-03-13
 * @updated 2026-03-26 Use async getToken() (cookie-based) instead of synchronous localStorage.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { gqlMe } from "@/lib/graphql-client";
import { COPY } from "@/lib/copy";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) router.replace("/login");
        return;
      }
      try {
        const user = await gqlMe(token);
        if (cancelled) return;
        if (!user || user.role !== "admin") {
          router.replace("/login");
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--admin-muted)]">{COPY.guard.loading}</p>
      </div>
    );
  }
  return <>{children}</>;
}
