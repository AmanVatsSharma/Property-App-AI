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
} as const;

export const ERROR_STATUS: Record<string, number> = {
  [ERROR_CODES.PROPERTY_NOT_FOUND]: 404,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
};
