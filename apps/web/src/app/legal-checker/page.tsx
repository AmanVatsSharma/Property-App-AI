/**
 * @file page.tsx
 * @module app/legal-checker
 * @description Legal Checker & RERA page — AI-powered legal query chat.
 * @author BharatERP
 * @created 2026-03-19
 */

import type { Metadata } from "next";
import LegalCheckerClient from "./LegalCheckerClient";

export const metadata: Metadata = {
  title: "Legal Checker & RERA — UrbanNest.ai",
  description:
    "Verify RERA project status and get AI-powered legal risk analysis.",
};

export default function LegalCheckerPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">
          Legal Checker & <em className="teal">RERA</em>
        </h1>
        <p className="sub">
          Ask our AI about any project&apos;s RERA status, legal risks, title
          clarity, and document red flags — instantly.
        </p>
      </div>
      <LegalCheckerClient />
    </div>
  );
}
