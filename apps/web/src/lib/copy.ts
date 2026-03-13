/**
 * @file copy.ts
 * @module web/lib
 * @description Centralised copy keys for i18n-ready UI strings (default locale).
 * @author BharatERP
 * @created 2025-03-13
 */

/**
 * Mobile app / desktop prompt shown when web is opened on mobile.
 * Keys: mobilePrompt.* for future t('mobilePrompt.headline') etc.
 */
export const MOBILE_PROMPT_COPY = {
  headline: "Better experience on app or desktop",
  body: "Download our app for the best experience, or continue here on your phone.",
  downloadApp: "Download the app",
  continueHere: "Continue on this device",
} as const;

/**
 * App store URLs. Set NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL in env when available.
 */
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "#";
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "#";
