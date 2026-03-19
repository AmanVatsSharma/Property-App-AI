/**
 * @file page.tsx
 * @module app/neighbourhood
 * @description Neighbourhood Score Explorer — server wrapper; client fetches GET /api/v1/neighbourhood.
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { NeighbourhoodExplorerClient } from "./NeighbourhoodExplorerClient";

export const metadata: Metadata = buildMetadata({
  title: "Neighbourhood Score Explorer",
  description:
    "Compare Indian localities on safety, commute, schools, hospitals, and 40+ livability signals. Make data-driven real estate decisions.",
  path: "/neighbourhood",
  keywords: [
    "neighbourhood score India",
    "best locality Bangalore",
    "safe areas Mumbai",
    "livability score",
  ],
});

export default function NeighbourhoodPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">
          Neighbourhood <em className="teal">Score Explorer</em>
        </h1>
        <p className="sub">
          Compare localities on safety, commute, schools, hospitals, and 40+ signals. Make informed decisions.
        </p>
      </div>
      <NeighbourhoodExplorerClient />
    </div>
  );
}
