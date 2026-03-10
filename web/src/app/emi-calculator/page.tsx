/**
 * @file page.tsx
 * @module app/emi-calculator
 * @description EMI & Loan Calculator
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import EMICalculatorClient from "@/components/emi/EMICalculatorClient";

export const metadata: Metadata = {
  title: "EMI Calculator — UrbanNest.ai",
  description: "Calculate your monthly EMI, compare bank rates, and check loan eligibility.",
};

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
