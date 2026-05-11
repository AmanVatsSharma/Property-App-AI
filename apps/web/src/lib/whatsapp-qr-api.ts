/**
 * File:        apps/web/src/lib/whatsapp-qr-api.ts
 * Module:      lib / auth
 * Purpose:     REST API client for WhatsApp QR OTP authentication flow
 *
 * Exports:
 *   - initWhatsAppQr(phoneNumber) → Promise<WhatsAppQrInitResponse>  — initialize QR session
 *   - getWhatsAppQrStatus(sessionId) → Promise<WhatsAppQrStatusResponse>  — poll QR status
 *   - verifyWhatsAppQrOtp(sessionId, otp) → Promise<WhatsAppQrVerifyResponse>  — verify OTP
 *   - cleanupWhatsAppQrSession(sessionId) → Promise<void>  — cleanup session
 *
 * Depends on:
 *   - process.env.NEXT_PUBLIC_API_URL — API base URL
 *
 * Side-effects:
 *   - None (pure API calls)
 *
 * Key invariants:
 *   - Phone number must be 10-digit Indian mobile
 *   - Session ID from init must be used for status/verify/cleanup
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export interface WhatsAppQrInitResponse {
  sessionId: string;
  qrCode: string; // base64 PNG data URL
}

export interface WhatsAppQrStatusResponse {
  status: "pending" | "scanned" | "ready" | "failed";
  otpSent?: boolean;
}

export interface WhatsAppQrVerifyResponse {
  success: boolean;
  accessToken?: string;
  user?: {
    id: string;
    phone: string;
    displayName: string | null;
    role: string;
  };
  message?: string;
}

/**
 * Initialize WhatsApp QR session for a given phone number.
 */
export async function initWhatsAppQr(
  phoneNumber: string
): Promise<WhatsAppQrInitResponse> {
  const res = await fetch(`${API_BASE}/auth/otp/whatsapp-qr/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      message: "Failed to initialize QR session",
    }));
    throw new Error(error.message || "Failed to initialize QR session");
  }

  return res.json();
}

/**
 * Poll for QR code scan status.
 */
export async function getWhatsAppQrStatus(
  sessionId: string
): Promise<WhatsAppQrStatusResponse> {
  const res = await fetch(
    `${API_BASE}/auth/otp/whatsapp-qr/status/${sessionId}`
  );

  if (!res.ok) {
    throw new Error("Failed to get QR status");
  }

  return res.json();
}

/**
 * Verify the OTP received via WhatsApp.
 */
export async function verifyWhatsAppQrOtp(
  sessionId: string,
  otp: string
): Promise<WhatsAppQrVerifyResponse> {
  const res = await fetch(`${API_BASE}/auth/otp/whatsapp-qr/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, otp }),
  });

  return res.json();
}

/**
 * Cleanup the QR session after use or on error.
 */
export async function cleanupWhatsAppQrSession(
  sessionId: string
): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/otp/whatsapp-qr/session/${sessionId}`, {
      method: "DELETE",
    });
  } catch {
    // Silently ignore cleanup errors
  }
}