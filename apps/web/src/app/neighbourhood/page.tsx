/**
 * @file page.tsx
 * @module app/neighbourhood
 * @description Neighbourhood Score Explorer — server wrapper; client fetches GET /api/v1/neighbourhood.
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import { NeighbourhoodExplorerClient } from "./NeighbourhoodExplorerClient";

export const metadata: Metadata = {
  title: "Neighbourhood Score Explorer — UrbanNest.ai",
  description: "Compare localities, check livability scores, and explore neighbourhood insights.",
};

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
