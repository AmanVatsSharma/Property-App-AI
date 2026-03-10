/**
 * @file EMICalculatorClient.tsx
 * @module emi
 * @description EMI calculator form and results
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { useState } from "react";

export default function EMICalculatorClient() {
  const [price, setPrice] = useState(150);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const loanLakh = price * (100 - down) / 100;
  const loanRupees = loanLakh * 100000;
  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi = monthlyRate > 0 && months > 0
    ? Math.round(loanRupees * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
    : 0;
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanRupees;

  const formatCr = (v: number) => v >= 100 ? `₹${(v / 100).toFixed(2)} Cr` : `₹${v} L`;
  const formatLac = (v: number) => v >= 100 ? `₹${(v / 100).toFixed(2)} Cr` : `₹${v} L`;

  return (
    <div className="emi-layout">
      <div>
        <div className="emi-form-card reveal">
          <h2>Calculate Your EMI</h2>
          <p>Adjust the sliders to instantly calculate your monthly payment</p>
          <div className="slider-group">
            <div className="slider-header"><span className="slider-label">Home Price</span><span className="slider-value">{formatCr(price)}</span></div>
            <input type="range" className="range" min={20} max={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            <div className="range-labels"><span>₹20L</span><span>₹10 Cr</span></div>
          </div>
          <div className="slider-group">
            <div className="slider-header"><span className="slider-label">Down Payment</span><span className="slider-value">₹{(price * down / 100).toFixed(0)}L ({down}%)</span></div>
            <input type="range" className="range" min={10} max={40} value={down} onChange={(e) => setDown(Number(e.target.value))} />
            <div className="range-labels"><span>10%</span><span>40%</span></div>
          </div>
          <div className="slider-group">
            <div className="slider-header"><span className="slider-label">Interest Rate</span><span className="slider-value">{rate}%</span></div>
            <input type="range" className="range" min={60} max={150} value={rate * 10} onChange={(e) => setRate(Number(e.target.value) / 10)} />
            <div className="range-labels"><span>6%</span><span>15%</span></div>
          </div>
          <div className="slider-group">
            <div className="slider-header"><span className="slider-label">Loan Tenure</span><span className="slider-value">{tenure} Years</span></div>
            <input type="range" className="range" min={5} max={30} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
            <div className="range-labels"><span>5 Yrs</span><span>30 Yrs</span></div>
          </div>
        </div>
      </div>
      <div className="reveal">
        <div className="emi-result-hero">
          <div className="emi-main">₹{emi >= 100000 ? `${(emi / 100000).toFixed(2)} L` : `${(emi / 1000).toFixed(0)}K`}</div>
          <div className="emi-main-label">Monthly EMI for {tenure} years</div>
          <div className="emi-breakdown">
            <div className="emib-item"><div className="emib-val">{formatLac(loanLakh)}</div><div className="emib-label">Loan Amount</div></div>
            <div className="emib-item"><div className="emib-val">₹{(totalInterest / 10000000).toFixed(2)} Cr</div><div className="emib-label">Total Interest</div></div>
            <div className="emib-item"><div className="emib-val">₹{(totalPayment / 10000000).toFixed(2)} Cr</div><div className="emib-label">Total Payment</div></div>
          </div>
        </div>
        <div style={{ background: "var(--dark-2)", border: "1px solid var(--border)", borderRadius: 18, padding: 24, marginBottom: 24 }}>
          <div className="eyebrow">Bank Comparison</div>
          <div className="h3" style={{ marginBottom: 4 }}>Best Home Loan Rates</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 0 }}>Live rates updated daily</p>
          <div className="bank-grid">
            <div className="bank-card best"><div className="bank-name">SBI Home Loan</div><div className="bank-rate">8.40% <span>p.a.</span></div><div className="bank-emi">EMI: ₹{(emi * 0.97 / 1000).toFixed(0)}K/mo</div><div className="bank-best-badge">✦ Best Rate</div></div>
            <div className="bank-card"><div className="bank-name">HDFC Bank</div><div className="bank-rate">8.50% <span>p.a.</span></div><div className="bank-emi">EMI: ₹{(emi / 1000).toFixed(0)}K/mo</div></div>
            <div className="bank-card"><div className="bank-name">ICICI Bank</div><div className="bank-rate">8.60% <span>p.a.</span></div><div className="bank-emi">EMI: ₹{(emi * 1.01 / 1000).toFixed(0)}K/mo</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
