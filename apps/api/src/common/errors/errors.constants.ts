/**
 * @file errors.constants.ts
 * @module common/errors
 * @description Error codes and HTTP status mapping for API consumers.
 * @author BharatERP
 * @created 2025-03-10
 */

export const ERROR_CODES = {
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AGENT_ERROR: 'AGENT_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  AREA_NOT_FOUND: 'AREA_NOT_FOUND',
} as const;

export const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.PROPERTY_NOT_FOUND]: 404,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.AGENT_ERROR]: 503,
  [ERROR_CODES.USER_NOT_FOUND]: 404,
  [ERROR_CODES.AREA_NOT_FOUND]: 404,
};
