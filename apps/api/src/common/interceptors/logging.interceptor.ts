/**
 * @file logging.interceptor.ts
 * @module common/interceptors
 * @description Logs request method/path or GraphQL operation, requestId, and duration.
 * @author BharatERP
 * @created 2025-03-10
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../../shared/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<string>();
    const start = Date.now();
    let requestId = 'unknown';
    let meta: string;

    if (type === 'http') {
      const req = context.switchToHttp().getRequest<{ method?: string; path?: string; requestId?: string }>();
      requestId = req?.requestId ?? requestId;
      meta = `${req?.method ?? 'HTTP'} ${req?.path ?? ''}`;
    } else {
      const gql = GqlExecutionContext.create(context);
      const ctx = gql.getContext();
      requestId = (ctx?.req && (ctx.req as { requestId?: string }).requestId) ?? ctx?.requestId ?? requestId;
      const info = gql.getInfo();
      meta = `GraphQL ${info?.operation?.name?.value ?? info?.fieldName ?? 'op'}`;
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        logger.info(
          { requestId, durationMs: duration, context: 'LoggingInterceptor' },
          `${meta} completed in ${duration}ms`,
        );
      }),
    );
  }
}
