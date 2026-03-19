/**
 * @file page.tsx
 * @module app/broker
 * @description Broker dashboard — listings, enquiries, verification.
 * @author BharatERP
 * @created 2026-03-19
 */

import type { Metadata } from "next";
import BrokerDashboardClient from "./BrokerDashboardClient";

export const metadata: Metadata = {
  title: "Broker Dashboard — UrbanNest.ai",
  description:
    "Manage your listings, enquiries, and broker verification status.",
};

export default function BrokerPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">Broker Portal</div>
        <h1 className="h1">
          Broker <em className="teal">Dashboard</em>
        </h1>
        <p className="sub">
          Manage listings, track enquiries, and grow your business with
          AI-powered tools.
        </p>
      </div>
      <BrokerDashboardClient />
    </div>
  );
}
