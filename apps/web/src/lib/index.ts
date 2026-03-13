/**
 * @file index.ts
 * @module lib
 * @description Re-exports for lib (logger, api-client)
 * @author BharatERP
 * @created 2025-03-10
 */

export { logger, default as loggerDefault } from "./logger";
export {
  MOBILE_PROMPT_COPY,
  APP_STORE_URL,
  PLAY_STORE_URL,
} from "./copy";
export {
  apiFetch,
  apiGet,
  apiPost,
  ApiError,
  type ApiClientConfig,
} from "./api-client";
export { getPropertyById, type PropertyDetail } from "./property-api";
export { DEMO_IMAGES, type CityName, type PropertyId } from "./demo-images";
