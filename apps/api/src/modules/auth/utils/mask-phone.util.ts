/**
 * @file mask-phone.util.ts
 * @module auth
 * @description Mask Indian mobile numbers for logs and API responses (last 4 visible).
 * @author BharatERP
 * @created 2026-03-28
 */

/** Normalize to last 10 digits (Indian local). */
export function normalizeIndianLocal10(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/** `*******3210` style mask for logging. */
export function maskIndianPhone(phone: string): string {
  const local = normalizeIndianLocal10(phone);
  if (local.length < 4) {
    return '****';
  }
  return `******${local.slice(-4)}`;
}

/** `+91 ****3210` for client-safe display. */
export function maskIndianPhoneE164(phone: string): string {
  const local = normalizeIndianLocal10(phone);
  if (local.length !== 10) {
    return '+91 ****';
  }
  return `+91 ******${local.slice(-4)}`;
}
