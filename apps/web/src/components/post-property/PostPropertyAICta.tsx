/**
 * @file PostPropertyAICta.tsx
 * @module post-property
 * @description CTA to open AI panel with prefill for posting a listing via conversation.
 * @author BharatERP
 * @created 2025-03-12
 */

"use client";

import { useAIFab } from "@/components/providers/AIFabProvider";

const PREFILL_PROMPT = "I want to post a listing";

export default function PostPropertyAICta() {
  const { openPanelWithPrompt } = useAIFab();

  return (
    <div className="post-ai-cta flex flex-col items-center gap-3 text-center">
      <p className="post-ai-cta-text text-[var(--text)] text-base">
        Or describe your property in your own words — our AI will create the listing for you.
      </p>
      <button
        type="button"
        className="btn-outline"
        onClick={() => openPanelWithPrompt(PREFILL_PROMPT)}
        style={{ padding: "12px 24px" }}
      >
        Describe &amp; post with AI →
      </button>
    </div>
  );
}
