/**
 * @file LoginModal.tsx
 * @module auth
 * @description Login modal: phone input → send OTP → code input → verify; stores token on success.
 * @author BharatERP
 * @created 2025-03-12
 */

"use client";

import { useState } from "react";
import { gqlSendOtp, gqlVerifyOtp } from "@/lib/graphql-client";
import { useAuth } from "@/components/providers/AuthProvider";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await gqlSendOtp(phone.trim());
      setStep("code");
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token: newToken } = await gqlVerifyOtp(phone.trim(), code.trim());
      setToken(newToken);
      onClose();
      setStep("phone");
      setPhone("");
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setPhone("");
    setCode("");
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative bg-bg border border-border rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 id="login-modal-title" className="text-xl font-bold mb-4">
          Sign in with mobile
        </h2>
        {step === "phone" ? (
          <form onSubmit={handleSendOtp}>
            <label className="block text-sm font-medium mb-2" htmlFor="login-phone">
              Mobile number (10 digits)
            </label>
            <input
              id="login-phone"
              type="tel"
              className="input w-full mb-3"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoComplete="tel"
            />
            {error && (
              <p className="text-sm text-[var(--coral)] mb-3" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Code sent to {phone.replace(/\D/g, "").slice(-10)}
            </p>
            <label className="block text-sm font-medium mb-2" htmlFor="login-code">
              Enter 6-digit code
            </label>
            <input
              id="login-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input w-full mb-3"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              autoComplete="one-time-code"
            />
            {error && (
              <p className="text-sm text-[var(--coral)] mb-3" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-outline flex-1"
                onClick={() => { setStep("phone"); setError(null); }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verifying…" : "Verify"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
