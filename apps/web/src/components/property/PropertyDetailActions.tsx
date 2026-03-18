/**
 * @file PropertyDetailActions.tsx
 * @module components/property
 * @description Client actions: favorite, enquire, change status (owner).
 * @author BharatERP
 * @created 2026-03-18
 */

"use client";

import { useState, useEffect } from "react";
import {
  gqlToggleFavorite,
  gqlSendEnquiry,
  gqlChangePropertyStatus,
  gqlMe,
} from "@/lib/graphql-client";
import { useAuth } from "@/components/providers/AuthProvider";

interface PropertyDetailActionsProps {
  propertyId: string;
  createdByUserId?: string | null;
  currentStatus?: string | null;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
] as const;

export function PropertyDetailActions({
  propertyId,
  createdByUserId,
  currentStatus,
}: PropertyDetailActionsProps) {
  const { token } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setUserId(null);
      return;
    }
    let cancelled = false;
    gqlMe({ Authorization: `Bearer ${token}` }).then((me) => {
      if (!cancelled && me) setUserId(me.id);
    }).catch(() => { if (!cancelled) setUserId(null); });
    return () => { cancelled = true; };
  }, [token]);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus ?? "active");

  const isOwner = Boolean(userId && createdByUserId && userId === createdByUserId);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const handleFavorite = async () => {
    if (!token) return;
    try {
      const res = await gqlToggleFavorite(propertyId, headers);
      setSaved(res.saved);
    } catch {
      // ignore
    }
  };

  const handleSendEnquiry = async () => {
    if (!token || !enquiryMessage.trim()) return;
    setEnquirySubmitting(true);
    try {
      await gqlSendEnquiry(
        { propertyId, message: enquiryMessage.trim(), phone: enquiryPhone.trim() || undefined },
        headers,
      );
      setEnquirySent(true);
      setEnquiryMessage("");
      setEnquiryPhone("");
      setEnquireOpen(false);
    } catch {
      // ignore
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!token || !isOwner) return;
    setStatusChanging(true);
    try {
      await gqlChangePropertyStatus(propertyId, status, headers);
      setLocalStatus(status);
    } catch {
      // ignore
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {token && (
        <button
          type="button"
          className="btn-ghost-sm"
          onClick={handleFavorite}
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? "❤️ Saved" : "♡ Save"}
        </button>
      )}
      <button type="button" className="btn-ghost-sm">⤴ Share</button>
      {token && (
        <>
          <button
            type="button"
            className="btn-ghost-sm"
            onClick={() => setEnquireOpen(true)}
          >
            Enquire
          </button>
          {enquireOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-[var(--dark-2)] border border-[var(--border)] p-4 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Send enquiry</h3>
                <textarea
                  className="w-full min-h-[100px] rounded-lg bg-[var(--dark)] border border-[var(--border)] text-white p-2 text-sm resize-y"
                  placeholder="Your message..."
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  maxLength={1000}
                />
                <input
                  type="tel"
                  className="w-full mt-2 rounded-lg bg-[var(--dark)] border border-[var(--border)] text-white p-2 text-sm"
                  placeholder="Phone (optional)"
                  value={enquiryPhone}
                  onChange={(e) => setEnquiryPhone(e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg bg-[var(--teal)] text-[var(--btn-primary-text)] font-medium disabled:opacity-50"
                    onClick={handleSendEnquiry}
                    disabled={enquirySubmitting || !enquiryMessage.trim()}
                  >
                    {enquirySubmitting ? "Sending…" : "Send"}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
                    onClick={() => { setEnquireOpen(false); setEnquirySent(false); }}
                  >
                    Cancel
                  </button>
                </div>
                {enquirySent && <p className="mt-2 text-sm text-[var(--green)]">Enquiry sent.</p>}
              </div>
            </div>
          )}
        </>
      )}
      {isOwner && (
        <div className="flex items-center gap-2">
          <label htmlFor="status-select" className="text-sm text-[var(--text-muted)]">Status:</label>
          <select
            id="status-select"
            className="rounded-lg bg-[var(--dark-2)] border border-[var(--border)] text-white px-2 py-1 text-sm"
            value={localStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusChanging}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
