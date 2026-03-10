/**
 * @file http-exception.filter.ts
 * @module common/filters
 * @description Maps AppError and Nest exceptions to HTTP response; logs requestId and stack.
 * @author BharatERP
 * @created 2025-03-10
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request } from 'express';
import { AppError } from '../errors/app.error';
import { logger } from '../../shared/logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const requestId = (ctx?.req && (ctx.req as Request).requestId) ?? ctx?.requestId ?? 'unknown';

    if (exception instanceof AppError) {
      logger.error(
        { requestId, context: 'HttpExceptionFilter', stack: exception.stack },
        `${exception.code}: ${exception.message}`,
      );
      this.respond(host, exception.statusCode, {
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = typeof res === 'object' && res !== null && 'message' in res
        ? (res as { message: string | string[] }).message
        : exception.message;
      logger.warn({ requestId, context: 'HttpExceptionFilter' }, `${status}: ${JSON.stringify(message)}`);
      this.respond(host, status, {
        statusCode: status,
        message: Array.isArray(message) ? message[0] : message,
      });
      return;
    }

    const err = exception as Error;
    logger.error(
      { requestId, context: 'HttpExceptionFilter', stack: err?.stack },
      err?.message ?? 'Unknown error',
    );
    this.respond(host, HttpStatus.INTERNAL_SERVER_ERROR, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private respond(
    host: ArgumentsHost,
    statusCode: number,
    body: Record<string, unknown>,
  ): void {
    const type = host.getType();
    if (type === 'http') {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest<Request & { path?: string }>();
      if (req?.path?.includes('graphql')) {
        return;
      }
      const response = ctx.getResponse<Response>();
      const res = response as unknown as { status: (s: number) => unknown; json: (b: unknown) => unknown };
      res.status(statusCode);
      res.json(body);
    }
  }
}
