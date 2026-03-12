/**
 * @file AIFabProvider.tsx
 * @module providers
 * @description Context to open AI Fab panel with optional prefilled prompt from any page.
 * @author BharatERP
 * @created 2025-03-12
 */

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AIFabContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openPanelWithPrompt: (prompt: string) => void;
  prefillPrompt: string | null;
  clearPrefillPrompt: () => void;
}

const AIFabContext = createContext<AIFabContextValue | null>(null);

export function AIFabProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState<string | null>(null);

  const openPanelWithPrompt = useCallback((prompt: string) => {
    setPrefillPrompt(prompt);
    setOpen(true);
  }, []);

  const clearPrefillPrompt = useCallback(() => setPrefillPrompt(null), []);

  const value: AIFabContextValue = {
    isOpen,
    setOpen,
    openPanelWithPrompt,
    prefillPrompt,
    clearPrefillPrompt,
  };

  return <AIFabContext.Provider value={value}>{children}</AIFabContext.Provider>;
}

export function useAIFab(): AIFabContextValue {
  const ctx = useContext(AIFabContext);
  if (!ctx) throw new Error("useAIFab must be used within AIFabProvider");
  return ctx;
}
