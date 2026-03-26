/**
 * @file page.tsx
 * @module app/admin
 * @description Admin control panel route: stats and user management.
 * @author BharatERP
 * @created 2026-03-19
 */

import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin — KonKreet",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">Admin</div>
        <h1 className="h1">Control <em className="teal">Panel</em></h1>
      </div>
      <AdminClient />
    </div>
  );
}
