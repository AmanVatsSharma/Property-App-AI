/**
 * @file page.tsx
 * @module app/saved-searches
 * @description Saved searches management page — create, toggle alerts, delete.
 * @author BharatERP
 * @created 2026-03-19
 */

import type { Metadata } from "next";
import SavedSearchesClient from "./SavedSearchesClient";

export const metadata: Metadata = {
  title: "Saved Searches — KonKreet",
  description: "Manage your saved property searches and alert preferences.",
};

export default function SavedSearchesPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">My Account</div>
        <h1 className="h1">
          Saved <em className="teal">Searches</em>
        </h1>
        <p className="sub">
          Get notified when new properties match your criteria.
        </p>
      </div>
      <SavedSearchesClient />
    </div>
  );
}
