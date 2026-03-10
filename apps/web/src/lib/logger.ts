/**
 * @file logger.ts
 * @module lib
 * @description Frontend logger for debug/info/warn/error; no-op or remote in prod
 * @author BharatERP
 * @created 2025-03-10
 */

const PREFIX = "[UrbanNest]";
const isDev = typeof window !== "undefined" && process.env.NODE_ENV !== "production";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(PREFIX, ...args);
  },
  info: (...args: unknown[]) => {
    console.info(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(PREFIX, ...args);
  },
};

export default logger;
