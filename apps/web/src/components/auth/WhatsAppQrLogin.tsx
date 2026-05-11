/**
 * File:        apps/web/src/components/auth/WhatsAppQrLogin.tsx
 * Module:      components / auth
 * Purpose:     WhatsApp QR OTP login — scan QR with WhatsApp, receive OTP, verify
 *
 * Exports:
 *   - WhatsAppQrLogin                  — default export, full auth component
 *   - WhatsAppQrLoginProps (type)      — component props
 *   - QrStatus (enum)                  — state machine for login flow
 *
 * Depends on:
 *   - @/lib/whatsapp-qr-api           — API client for WhatsApp QR endpoints
 *   - @/lib/utils                     — cn() utility
 *
 * Side-effects:
 *   - None (pure UI component, manages own state)
 *
 * Key invariants:
 *   - Phone number must be 10-digit Indian mobile
 *   - QR polls every 2 seconds until scanned/ready/failed
 *   - OTP must be 6 digits auto-verified on complete
 *
 * Read order:
 *   1. QrStatus — understand the state machine
 *   2. WhatsAppQrLogin — main component with step flow
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  initWhatsAppQr,
  getWhatsAppQrStatus,
  verifyWhatsAppQrOtp,
  cleanupWhatsAppQrSession,
} from "@/lib/whatsapp-qr-api";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types / State Machine
// ─────────────────────────────────────────────

export type QrStatus =
  | "idle"
  | "loading"
  | "qr_ready"
  | "scanning"
  | "scanned"
  | "otp_sent"
  | "verifying"
  | "success"
  | "error";

export interface WhatsAppQrLoginProps {
  /** Callback fired after successful OTP verification */
  onSuccess?: () => void;
  /** CSS class for the card container */
  className?: string;
}

// ─────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Phone" },
  { id: 2, label: "Scan QR" },
  { id: 3, label: "Enter OTP" },
  { id: 4, label: "Done" },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                isCompleted
                  ? "bg-[#25D366] text-white"
                  : isActive
                    ? "bg-[#25D366] text-white ring-4 ring-[#25D366]/20"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              )}
            >
              {isCompleted ? (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 transition-all duration-300",
                  isCompleted ? "bg-[#25D366]" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Loading Spinner
// ─────────────────────────────────────────────

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-5 w-5", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// 6-Digit OTP Input
// ─────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const newValue = value.slice(0, index) + char + value.slice(index + 1);
    const trimmed = newValue.replace(/\D/g, "").slice(0, 6);
    onChange(trimmed);

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200",
            "bg-white dark:bg-gray-900",
            "border-gray-200 dark:border-gray-700",
            "focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/20 focus:outline-none",
            "dark:border-gray-600 dark:bg-gray-800",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// WhatsApp SVG Icon
// ─────────────────────────────────────────────

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function WhatsAppQrLogin({
  onSuccess,
  className,
}: WhatsAppQrLoginProps) {
  // ── State ──────────────────────────────
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<QrStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Auth integration ─────────────────
  const { setToken } = useAuth();

  // ── Poll interval ref ───────────────────
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup on unmount ─────────────────
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (sessionId) {
        cleanupWhatsAppQrSession(sessionId).catch(() => {});
      }
    };
  }, [sessionId]);

  // ── Auto-verify when OTP complete ───────
  useEffect(() => {
    if (status === "otp_sent" && otp.length === 6) {
      handleVerify();
    }
  }, [otp, status]);

  // ── Compute current step ────────────────
  const currentStep = (() => {
    switch (status) {
      case "idle":
      case "loading":
        return 1;
      case "qr_ready":
      case "scanning":
        return 2;
      case "scanned":
      case "otp_sent":
      case "verifying":
        return 3;
      case "success":
        return 4;
      default:
        return 1;
    }
  })();

  // ── Step 1: Request QR ───────────────────
  const handleGetQr = async () => {
    // Basic validation
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await initWhatsAppQr(cleaned);
      setSessionId(result.sessionId);
      setQrCode(result.qrCode);
      setStatus("qr_ready");

      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollStatus(result.sessionId);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize WhatsApp QR. Please try again."
      );
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Poll status ──────────────────────────
  const pollStatus = async (sid: string) => {
    try {
      const result = await getWhatsAppQrStatus(sid);

      if (result.status === "scanned") {
        setStatus("scanned");
        clearInterval(pollIntervalRef.current!);
        // Short delay then show OTP input
        setTimeout(() => setStatus("otp_sent"), 1500);
      } else if (result.status === "ready" || result.otpSent) {
        setStatus("otp_sent");
        clearInterval(pollIntervalRef.current!);
      } else if (result.status === "failed") {
        setStatus("error");
        setError("QR code expired or session failed. Please request a new QR.");
        clearInterval(pollIntervalRef.current!);
      }
      // "pending" → continue polling
    } catch {
      // Network glitch on poll — keep polling
    }
  };

  // ── Step 3: Verify OTP ──────────────────
  const handleVerify = async () => {
    if (!sessionId || otp.length !== 6) return;

    setIsLoading(true);
    setStatus("verifying");

    try {
      const result = await verifyWhatsAppQrOtp(sessionId, otp);

      if (result.success && result.accessToken) {
        setStatus("success");
        // Store token via AuthProvider (httpOnly cookie pattern)
        setToken(result.accessToken);
        onSuccess?.();
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
        setStatus("otp_sent");
        setOtp("");
      }
    } catch {
      setError("Verification failed. Please try again.");
      setStatus("otp_sent");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend QR ───────────────────────────
  const handleResendQr = async () => {
    if (sessionId) {
      await cleanupWhatsAppQrSession(sessionId).catch(() => {});
    }
    setSessionId(null);
    setQrCode(null);
    setOtp("");
    setError(null);
    setStatus("idle");
  };

  // ─────────────────────────────────────────
  // Render — Step 1: Phone Input
  // ─────────────────────────────────────────
  if (status === "idle" || status === "error") {
    return (
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8",
          className
        )}
      >
        {/* WhatsApp Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center mb-4 shadow-lg">
            <WhatsAppIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login with WhatsApp
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Scan a QR code with your WhatsApp to securely authenticate
          </p>
        </div>

        {/* Phone Input */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="wa-phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium">
                +91
              </span>
              <input
                id="wa-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                className={cn(
                  "flex-1 px-4 py-3 rounded-r-xl border text-gray-900 dark:text-white",
                  "bg-white dark:bg-gray-900",
                  "border-gray-300 dark:border-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent",
                  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                  "text-base"
                )}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <svg
                className="w-5 h-5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-400">
                {error}
              </span>
            </div>
          )}

          <button
            onClick={handleGetQr}
            disabled={isLoading || phone.length !== 10}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200",
              "bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isLoading ? (
              <>
                <Spinner className="text-white" />
                <span>Generating QR...</span>
              </>
            ) : (
              <>
                <WhatsAppIcon size={20} />
                <span>Get QR Code</span>
              </>
            )}
          </button>
        </div>

        {/* Divider + Login Link */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-[#0f172a] text-gray-400">
              Already have an account?
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="mt-4 block w-full py-3 text-center rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          Login with Email / OTP
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Render — Step 2: QR Code Display
  // ─────────────────────────────────────────
  if (status === "loading" || status === "qr_ready" || status === "scanning") {
    return (
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8",
          className
        )}
      >
        <StepIndicator currentStep={currentStep} />

        {/* WhatsApp Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center mb-3">
            <WhatsAppIcon size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Scan this QR Code
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Open WhatsApp on your phone and scan the QR code
          </p>
        </div>

        {/* QR Code Display */}
        <div className="relative flex justify-center mb-6">
          {qrCode ? (
            <div className="relative p-4 bg-white rounded-2xl shadow-md">
              <img
                src={qrCode}
                alt="WhatsApp QR Code"
                className="w-56 h-56 object-contain"
              />
              {/* Scanning Animation Overlay */}
              {status === "scanning" && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[#25D366]/5 animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <Spinner className="text-[#25D366]" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {status === "scanning" ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30">
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-sm font-medium text-[#128C7E]">
                  WhatsApp connected — waiting for OTP...
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Spinner className="text-[#25D366]" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Waiting for you to scan...
              </span>
            </div>
          )}
        </div>

        {/* Countdown / Expiry Info */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-4">
          QR code expires in 5 minutes
        </p>

        {/* Cancel Button */}
        <button
          onClick={handleResendQr}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Cancel & Re-enter Number
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Render — Step 3: OTP Input (after scan)
  // ─────────────────────────────────────────
  if (status === "scanned" || status === "otp_sent") {
    return (
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8",
          className
        )}
      >
        <StepIndicator currentStep={3} />

        {/* Success Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-[fadeIn_0.3s_ease]">
            <svg
              className="w-8 h-8 text-[#25D366]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            WhatsApp Connected!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            OTP has been sent to your WhatsApp chat
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Enter the 6-digit code from your WhatsApp
          </p>
          <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <svg
              className="w-5 h-5 text-red-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-400">
              {error}
            </span>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200",
            "bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {isLoading ? (
            <>
              <Spinner className="text-white" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Verify OTP</span>
            </>
          )}
        </button>

        {/* Resend QR */}
        <button
          onClick={handleResendQr}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Didn't receive the code? Get new QR
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Render — Success
  // ─────────────────────────────────────────
  if (status === "success") {
    return (
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-8 text-center",
          className
        )}
      >
        <StepIndicator currentStep={4} />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-[bounceIn_0.5s_ease]">
            <svg
              className="w-10 h-10 text-[#25D366]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            You've been securely logged in via WhatsApp.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors"
          >
            Go to Home
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Fallback — shouldn't reach here
  return null;
}