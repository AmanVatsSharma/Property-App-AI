/**
 * @file SaveSearchButton.tsx
 * @module search
 * @description Button to save current search filters with a name.
 * @author BharatERP
 * @created 2026-03-19
 */

"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { gqlCreateSavedSearch } from "@/lib/graphql-client";

interface SaveSearchButtonProps {
  filters: Record<string, unknown>;
}

export function SaveSearchButton({ filters }: SaveSearchButtonProps) {
  const { token, setOpenLoginModal } = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token) {
      setOpenLoginModal(true);
      return;
    }
    if (!name.trim()) return;
    setSaving(true);
    try {
      await gqlCreateSavedSearch(
        { name: name.trim(), filters, alertEnabled: true },
        { Authorization: `Bearer ${token}` },
      );
      showToast("Search saved! You'll get alerts for new matches.", "success");
      setOpen(false);
      setName("");
    } catch {
      showToast("Could not save search", "error");
    } finally {
      setSaving(false);
    }
  };

  if (open) {
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          className="input"
          placeholder="Name this search…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setOpen(false);
          }}
          style={{ width: 200, padding: "7px 12px", fontSize: 13 }}
          autoFocus
        />
        <button
          type="button"
          className="btn-primary"
          style={{ padding: "7px 14px", fontSize: 12 }}
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          type="button"
          className="btn-ghost-sm"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn-ghost-sm"
      onClick={() => setOpen(true)}
      style={{ display: "flex", alignItems: "center", gap: 5 }}
    >
      🔔 Save search
    </button>
  );
}
