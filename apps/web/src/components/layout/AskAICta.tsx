/**
 * @file AskAICta.tsx
 * @module layout
 * @description CTA button that opens the global AI Fab with a prefilled prompt (e.g. RERA, price forecast).
 * @author BharatERP
 * @created 2025-03-17
 */

"use client";

import { useAIFab } from "@/components/providers/AIFabProvider";

export interface AskAICtaProps {
  /** Prefilled prompt sent to the AI panel when the CTA is clicked */
  prompt: string;
  /** Button/link label (e.g. "Ask AI about this") */
  label: string;
  /** Optional test id for the CTA button */
  "data-testid"?: string;
  className?: string;
}

export default function AskAICta({
  prompt,
  label,
  "data-testid": dataTestId = "ask-ai-cta",
  className,
}: AskAICtaProps) {
  const { openPanelWithPrompt } = useAIFab();

  return (
    <button
      type="button"
      className={className ?? "btn-outline"}
      onClick={() => openPanelWithPrompt(prompt)}
      aria-label={label}
      data-testid={dataTestId}
    >
      {label}
    </button>
  );
}
