/**
 * @file AIThinkingChain.tsx
 * @module agent
 * @description Loading component that shows a chain of AI "thinking" steps while the agent is processing.
 * @author BharatERP
 * @created 2025-03-15
 */

"use client";

import { useState, useEffect } from "react";

const DEFAULT_STEPS = [
  "Understanding your query…",
  "Searching properties…",
  "Analyzing results…",
];

export interface AIThinkingChainProps {
  /** When true, the chain is visible and steps animate in. */
  active: boolean;
  /** Optional custom steps. Defaults to understanding → searching → analyzing. */
  steps?: string[];
  className?: string;
  "data-testid"?: string;
}

export function AIThinkingChain({
  active,
  steps = DEFAULT_STEPS,
  className,
  "data-testid": dataTestId = "ai-thinking-chain",
  ...rest
}: AIThinkingChainProps & Omit<React.HTMLAttributes<HTMLDivElement>, "children">) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(1);
    const interval = setInterval(() => {
      setVisibleCount((n) => (n < steps.length ? n + 1 : n));
    }, 800);
    return () => clearInterval(interval);
  }, [active, steps.length]);

  if (!active) return null;

  return (
    <div
      className={className}
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
      aria-label="AI is thinking"
      {...rest}
    >
      <div className="space-y-2">
        {steps.slice(0, visibleCount).map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-(--dark-2) border border-(--border) px-3 py-2 text-sm text-(--text-muted) motion-safe:animate-pulse"
            data-testid={`ai-thinking-step-${i}`}
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-(--teal) shrink-0"
              aria-hidden
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
