/**
 * @file page.tsx
 * @module app/price-forecast
 * @description Price Forecast — live AI-powered locality forecast.
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import PriceForecastClient from "./PriceForecastClient";

export const metadata: Metadata = {
  title: "Price Forecast — KonKreet",
  description:
    "ML-powered 12–36 month price appreciation forecasts for any locality.",
};

export default function PriceForecastPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">
          Price <em className="teal">Forecast</em>
        </h1>
        <p className="sub">
          AI-powered 12–36 month appreciation forecast based on demand signals,
          infrastructure, and market trends.
        </p>
      </div>
      <PriceForecastClient />
    </div>
  );
}
