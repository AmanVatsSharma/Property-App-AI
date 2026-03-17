/**
 * @file page.tsx
 * @module app/legal-checker
 * @description Legal Checker & RERA page — coming soon; no mock data; CTA opens AI Fab with prefill.
 * @author BharatERP
 * @created 2025-03-10
 */

import type { Metadata } from "next";
import AskAICta from "@/components/layout/AskAICta";

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
      <div style={{ padding: "40px 52px" }} data-testid="legal-checker-page">
        {/* Prominent coming-soon banner — no mock data or fake results */}
        <div
          role="status"
          aria-live="polite"
          className="card"
          style={{
            padding: "28px 32px",
            marginBottom: 28,
            background: "var(--teal-dim)",
            border: "1px solid rgba(0,212,170,0.3)",
            borderRadius: "var(--radius-sm)",
          }}
          data-testid="legal-checker-coming-soon"
        >
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)", marginBottom: 8 }}>
            Coming soon
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
            RERA verification will be available soon. The tools below are not live yet. No mock data or fake results are shown.
          </p>
          <AskAICta
            prompt="Ask about RERA or legal verification for properties"
            label="Ask AI about this"
            data-testid="legal-checker-ask-ai-cta"
            className="btn-outline"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 className="h3" style={{ marginBottom: 16 }}>RERA Project Search</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>Enter project name or RERA registration number to verify status</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. Sobha City Vista or HRERA-PKL-..."
                style={{ flex: 1 }}
                aria-label="RERA project name or registration number"
                aria-disabled="true"
                data-testid="legal-checker-search-input"
                disabled
                readOnly
              />
              <button type="button" className="btn-primary" disabled aria-disabled="true" data-testid="legal-checker-search-btn">
                Search
              </button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--white)", marginBottom: 16 }}>Document Checklist</h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload sale deed, title report, or NOC to get an AI-powered legal risk score.</p>
            <div
              role="button"
              aria-disabled="true"
              aria-label="Upload disabled — coming soon"
              data-testid="legal-checker-upload-zone"
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 16,
                padding: 40,
                textAlign: "center",
                marginTop: 16,
                background: "var(--glass)",
                opacity: 0.7,
                pointerEvents: "none",
                cursor: "not-allowed",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Drop files or click to upload</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>PDF, JPG up to 10MB — coming soon</div>
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
    </div>
  );
}
