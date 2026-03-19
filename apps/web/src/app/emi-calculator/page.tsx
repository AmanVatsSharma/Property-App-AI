/**
 * @file page.tsx
 * @module app/emi-calculator
 * @description EMI & Loan Calculator (EMICalculatorClient lazy-loaded)
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/seo";

const EMICalculatorClient = dynamic(
  () => import("@/components/emi/EMICalculatorClient").then((m) => m.default),
  { ssr: true, loading: () => <div className="loading-spinner mx-auto mt-8" aria-hidden /> }
);

export const metadata: Metadata = buildMetadata({
  title: "EMI Calculator",
  description:
    "Calculate your home loan EMI instantly. Compare SBI, HDFC, ICICI rates. Check loan eligibility and plan your property purchase smartly.",
  path: "/emi-calculator",
  keywords: [
    "home loan EMI calculator India",
    "home loan calculator",
    "SBI home loan rate",
    "HDFC home loan",
  ],
});

export default function EMICalculatorPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">EMI & <em className="teal">Loan Calculator</em></h1>
        <p className="sub">Calculate your monthly EMI, compare bank rates, and check your loan eligibility — all powered by real-time data.</p>
      </div>
      <EMICalculatorClient />
    </div>
  );
}
