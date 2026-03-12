/**
 * @file page.tsx
 * @module admin/app/login
 * @description Admin login page: OTP flow; redirects to dashboard if role is admin.
 * @author BharatERP
 * @created 2025-03-13
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gqlSendOtp, gqlVerifyOtp } from "@/lib/graphql-client";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
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
      const { token: newToken, user } = await gqlVerifyOtp(phone.trim(), code.trim());
      if (user.role !== "admin") {
        setError("Access denied. Admin only.");
        setLoading(false);
        return;
      }
      setToken(newToken);
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--admin-border)] bg-[var(--admin-sidebar)] p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-center mb-6">Admin sign in</h1>
        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm text-[var(--admin-muted)] mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                autoComplete="tel"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded py-2 bg-[var(--admin-accent)] text-white font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-[var(--admin-muted)]">
              Code sent to {phone}
            </p>
            <div>
              <label htmlFor="code" className="block text-sm text-[var(--admin-muted)] mb-1">
                OTP code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded py-2 bg-[var(--admin-accent)] text-white font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError(null);
              }}
              className="w-full text-sm text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
