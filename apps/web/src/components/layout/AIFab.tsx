/**
 * @file AIFab.tsx
 * @module layout
 * @description Floating AI assistant; multi-turn chat, conversation history, auth for create_listing.
 * @author BharatERP
 * @created 2025-03-10
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { gqlAskAgent, type AgentSource, type AgentSuggestedAction } from "@/lib/graphql-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAIFab } from "@/components/providers/AIFabProvider";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: AgentSource[];
  suggestedActions?: AgentSuggestedAction[];
}

export default function AIFab() {
  const { token } = useAuth();
  const { isOpen, setOpen, prefillPrompt, clearPrefillPrompt } = useAIFab();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<{ index: number; full: string } | null>(null);
  const [typingDisplayLen, setTypingDisplayLen] = useState(0);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setError(null);
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await gqlAskAgent(
        { prompt: trimmed, conversationHistory },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        sources: res.sources?.length ? res.sources : undefined,
        suggestedActions: res.suggestedActions?.length ? res.suggestedActions : undefined,
      };
      const newIndex = messages.length;
      setMessages((prev) => [...prev, assistantMessage]);
      setTyping({ index: newIndex, full: res.answer });
      setTypingDisplayLen(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  }, [prompt, loading, messages, token]);

  useEffect(() => {
    if (!typing) return;
    const id = setInterval(() => {
      setTypingDisplayLen((len) => {
        const next = Math.min(len + 2, typing.full.length);
        if (next >= typing.full.length) {
          setMessages((prev) =>
            prev.map((m, i) => (i === typing.index ? { ...m, content: typing.full } : m))
          );
          setTyping(null);
        }
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [typing]);

  useEffect(() => {
    if (isOpen && prefillPrompt) {
      setPrompt(prefillPrompt);
      clearPrefillPrompt();
    }
  }, [isOpen, prefillPrompt, clearPrefillPrompt]);

  return (
    <>
      <div className="ai-fab">
        <button
          type="button"
          className="ai-fab-btn"
          title="Talk to UrbanNest AI — search, compare, or post a listing"
          aria-label="Open AI assistant"
          onClick={() => setOpen(!isOpen)}
        >
          🤖
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[801] bg-black/50"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[802] bg-[var(--dark)] border-l border-[var(--border)] shadow-xl flex flex-col"
            role="dialog"
            aria-label="UrbanNest AI assistant"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-white">Talk to UrbanNest AI</h2>
              <button
                type="button"
                className="text-[var(--text-muted)] hover:text-white p-1"
                onClick={() => setOpen(false)}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <p className="px-4 py-1 text-xs text-[var(--text-muted)]">
              Search, compare, or post a listing. Sign in to create listings via the agent.
            </p>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-[var(--text-muted)] space-y-2">
                  <p>Ask about properties, neighbourhoods, prices, or say &quot;I want to post a listing&quot; to create one.</p>
                  <p>Try: &quot;I want to list my 2BHK in Koramangala for rent at ₹25,000&quot; — the AI will create the listing for you.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isTypingThis = typing?.index === i;
                const displayContent = isTypingThis
                  ? typing!.full.slice(0, typingDisplayLen)
                  : msg.content;
                return (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      msg.role === "user"
                        ? "max-w-[85%] rounded-xl bg-[var(--teal-dim)] border border-[var(--teal)]/30 text-[var(--text)] p-3 text-sm"
                        : "max-w-[85%] rounded-xl bg-[var(--dark-2)] border border-[var(--border)] text-[var(--text)] p-3 text-sm whitespace-pre-wrap"
                    }
                  >
                    {displayContent}
                    {msg.role === "assistant" && !isTypingThis && msg.sources?.length ? (
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        Sources: {msg.sources.map((s) => s.label).join(", ")}
                      </div>
                    ) : null}
                    {msg.role === "assistant" && !isTypingThis && msg.suggestedActions?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((a, j) => (
                          <a
                            key={j}
                            href={a.target ?? "#"}
                            className="px-2 py-1 rounded-lg bg-[var(--teal-dim)] text-[var(--teal)] text-xs"
                          >
                            {a.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-[var(--dark-2)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-muted)]">
                    Thinking…
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="ai-prompt" className="block text-sm text-[var(--text-muted)] mb-2">
                  Message
                </label>
                <textarea
                  id="ai-prompt"
                  className="w-full min-h-[80px] rounded-xl bg-[var(--dark-2)] border border-[var(--glass-border)] text-white p-3 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                  placeholder="e.g. 3 BHK under ₹1 Cr in Bangalore, or I want to list my 2BHK for rent"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-xl bg-[var(--teal)] text-[var(--btn-primary-text)] font-semibold disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? "Thinking…" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
