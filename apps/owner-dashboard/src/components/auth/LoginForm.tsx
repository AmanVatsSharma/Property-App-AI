/**
 * @file LoginForm.tsx
 * @module owner-dashboard/components/auth
 * @description Login form with OTP
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

"use client";

import { useState } from "react";

interface LoginFormProps {
  onLogin: (phone: string, otp: string) => Promise<void>;
  error: string | null;
}

export function LoginForm({ onLogin, error }: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      if (response.ok) {
        setStep("otp");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await onLogin(phone, otp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 9876543210"
          className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
      </div>

      {step === "otp" && (
        <div>
          <label className="block text-sm font-medium mb-2 text-[hsl(var(--foreground))]">
            OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      )}

      <button
        onClick={step === "phone" ? handleSendOtp : handleVerify}
        disabled={loading || !phone}
        className="w-full py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Please wait..." : step === "phone" ? "Send OTP" : "Verify OTP"}
      </button>
    </div>
  );
}