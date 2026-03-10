/**
 * @file logger.service.ts
 * @module shared/logger
 * @description Pino instance and LoggerService for injection; context and requestId for correlation.
 * @author BharatERP
 * @created 2025-03-10
 */

import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  transport:
    !isProd
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export interface LogContext {
  context?: string;
  requestId?: string;
  [key: string]: unknown;
}

export class LoggerService {
  constructor(private readonly context?: string) {}

  log(message: string, meta?: LogContext): void {
    logger.info({ ...meta, context: this.context }, message);
  }

  error(message: string, trace?: string, meta?: LogContext): void {
    logger.error({ ...meta, context: this.context, stack: trace }, message);
  }

  warn(message: string, meta?: LogContext): void {
    logger.warn({ ...meta, context: this.context }, message);
  }

  debug(message: string, meta?: LogContext): void {
    logger.debug({ ...meta, context: this.context }, message);
  }
}
