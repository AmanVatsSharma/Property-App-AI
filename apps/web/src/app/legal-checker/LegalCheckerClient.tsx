/**
 * @file LegalCheckerClient.tsx
 * @module app/legal-checker
 * @description Legal checker AI chat: quick prompts and askAgent conversation.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useState } from "react";
import { gqlAskAgent } from "@/lib/graphql-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { AIThinkingChain } from "@/components/agent/AIThinkingChain";

const QUICK_PROMPTS = [
  {
    icon: "🏗️",
    label: "Check RERA status",
    prompt: "Check RERA registration status for ",
  },
  {
    icon: "📄",
    label: "Title risk analysis",
    prompt:
      "What are the key title risk red flags I should check for a property in ",
  },
  {
    icon: "💰",
    label: "Stamp duty guide",
    prompt:
      "Explain stamp duty and registration charges for property purchase in ",
  },
  {
    icon: "⚖️",
    label: "Sale deed checklist",
    prompt: "Give me a sale deed checklist for buying a property in India",
  },
  {
    icon: "🔍",
    label: "Encumbrance check",
    prompt:
      "How do I check encumbrance certificate for a property in ",
  },
];

const THINKING_STEPS = [
  "Parsing legal query…",
  "Checking RERA guidelines…",
  "Analysing risk factors…",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LegalCheckerClient() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuery("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await gqlAskAgent(
        { prompt: trimmed, conversationHistory: history },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "32px 52px 80px",
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 28,
        alignItems: "start",
      }}
      data-testid="legal-checker-chat"
    >
      {/* Sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "sticky",
          top: 110,
        }}
      >
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Quick Actions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                className="card"
                style={{
                  padding: "11px 14px",
                  textAlign: "left",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  transition: "all 0.18s",
                  background: "var(--glass)",
                }}
                onClick={() => setQuery(qp.prompt)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(0,212,170,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "var(--teal)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--text-muted)";
                }}
              >
                <span style={{ fontSize: 18 }}>{qp.icon}</span>
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 20,
            background: "var(--teal-dim)",
            border: "1px solid rgba(0,212,170,0.2)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--teal)",
              marginBottom: 8,
            }}
          >
            ✦ AI-Powered
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Our AI uses RERA guidelines, legal best practices, and Indian
            property law to guide you. Always consult a registered lawyer for
            binding advice.
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && !loading && (
          <div
            style={{
              padding: "52px 32px",
              textAlign: "center",
              background: "var(--dark-2)",
              borderRadius: 20,
              border: "1px dashed var(--border)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>⚖️</div>
            <h3 className="h3" style={{ marginBottom: 8 }}>
              Legal AI Assistant
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                maxWidth: 380,
                margin: "0 auto",
              }}
            >
              Ask anything about RERA compliance, title risks, stamp duty,
              encumbrance, NOC requirements, or sale deed clauses.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                borderRadius: 16,
                padding: "13px 17px",
                fontSize: 14,
                lineHeight: 1.65,
                ...(m.role === "user"
                  ? {
                      background: "var(--teal-dim)",
                      border: "1px solid rgba(0,212,170,0.2)",
                      color: "var(--text)",
                    }
                  : {
                      background: "var(--dark-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",
                    }),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <AIThinkingChain active steps={THINKING_STEPS} />
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "var(--coral-dim)",
              border: "1px solid rgba(255,107,74,0.2)",
              color: "var(--coral)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            position: "sticky",
            bottom: 16,
            background: "var(--dark)",
            borderRadius: 18,
            border: "1px solid var(--border)",
            padding: "12px 12px 12px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
          data-testid="legal-checker-input"
        >
          <textarea
            className="input"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              resize: "none",
              minHeight: 44,
              maxHeight: 140,
              padding: "10px 0",
              lineHeight: 1.55,
              fontSize: 14,
            }}
            placeholder="Ask about RERA, legal risks, stamp duty, title checks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(query);
              }
            }}
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            className="btn-primary"
            style={{ padding: "11px 20px", borderRadius: 12, flexShrink: 0 }}
            onClick={() => ask(query)}
            disabled={loading || !query.trim()}
          >
            {loading ? "…" : "Ask ✦"}
          </button>
        </div>
      </div>
    </div>
  );
}
