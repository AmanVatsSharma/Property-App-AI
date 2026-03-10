/**
 * @file page.tsx
 * @module app/legal-checker
 * @description Legal Checker & RERA page
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Checker & RERA — UrbanNest.ai",
  description: "Verify RERA status, check legal documents, and ensure compliance.",
};

export default function LegalCheckerPage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">AI Tools</div>
        <h1 className="h1">Legal Checker & <em className="teal">RERA</em></h1>
        <p className="sub">Verify project RERA status, run document checks, and get a clear legal risk score before you buy.</p>
      </div>
      <div style={{ padding: "40px 52px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 className="h3" style={{ marginBottom: 16 }}>RERA Project Search</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Enter project name or RERA registration number to verify status</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <input type="text" className="input" placeholder="e.g. Sobha City Vista or HRERA-PKL-..." style={{ flex: 1 }} />
              <button type="button" className="btn-primary">Search</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Document Checklist</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload sale deed, title report, or NOC to get an AI-powered legal risk score.</p>
            <div style={{ border: "2px dashed var(--border)", borderRadius: 16, padding: 40, textAlign: "center", marginTop: 16, cursor: "pointer", background: "var(--glass)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--white)", marginBottom: 6 }}>Drop files or click to upload</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>PDF, JPG up to 10MB</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 24, height: "fit-content" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--white)", marginBottom: 12 }}>Why verify?</h4>
          <ul style={{ listStyle: "none", padding: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8 }}>
            <li>✓ RERA compliance ensures builder accountability</li>
            <li>✓ Reduces risk of fraud and delayed possession</li>
            <li>✓ Legal clarity score for every listing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
