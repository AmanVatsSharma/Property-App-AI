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
 * Neighbourhood explorer — keys for i18n (e.g. neighbourhood.connectApi, neighbourhood.loading).
 */
export const NEIGHBOURHOOD_COPY = {
  connectApi:
    "Connect API — set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_GRAPHQL_HTTP to see live scores.",
  loading: "Loading neighbourhood scores…",
  errorFallback: "Something went wrong. Try Refresh or check your connection.",
  noScore: "No score available for this locality.",
  overallLivabilityScore: "Overall Livability Score",
  refresh: "Refresh",
  city: "City",
  locality: "Locality",
  localityA: "Locality A",
  localityB: "Locality B",
  helperText:
    "Select city and locality, then use Refresh to load scores from the API.",
  requestFailed: "Request failed",
} as const;

/**
 * Footer credit line — powered by Vedpragya (i18n keys: footer.poweredBy, footer.vedpragya, footer.tagline).
 */
export const FOOTER_COPY = {
  poweredBy: "Powered by ",
  vedpragya: "Vedpragya",
  vedpragyaUrl: "https://vedpragya.com",
  tagline: " · Thoughtfully built for modern real estate",
} as const;

/**
 * App store URLs. Set NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL in env when available.
 */
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "#";
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "#";
