/**
 * @file index.ts
 * @module lib
 * @description Re-exports for lib (logger, api-client)
 * @author BharatERP
 * @created 2025-03-10
 */

export { logger, default as loggerDefault } from "./logger";
export {
  apiFetch,
  apiGet,
  apiPost,
  ApiError,
  type ApiClientConfig,
} from "./api-client";
export { getPropertyById, type PropertyDetail } from "./property-api";
