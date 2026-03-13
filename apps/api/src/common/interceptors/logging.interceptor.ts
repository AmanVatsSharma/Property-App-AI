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
import { logger } from '@api/shared/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<string>();
    const start = Date.now();
    let requestId = 'unknown';
    let meta: string;

    let userId: string | undefined;
    if (type === 'http') {
      const req = context.switchToHttp().getRequest<{ method?: string; path?: string; requestId?: string; user?: { sub?: string; id?: string } }>();
      requestId = req?.requestId ?? requestId;
      userId = req?.user?.sub ?? req?.user?.id;
      meta = `${req?.method ?? 'HTTP'} ${req?.path ?? ''}`;
    } else {
      const gql = GqlExecutionContext.create(context);
      const ctx = gql.getContext();
      const req = ctx?.req as { requestId?: string; user?: { sub?: string; id?: string } } | undefined;
      requestId = req?.requestId ?? (ctx as { requestId?: string })?.requestId ?? requestId;
      userId = req?.user?.sub ?? req?.user?.id;
      const info = gql.getInfo();
      meta = `GraphQL ${info?.operation?.name?.value ?? info?.fieldName ?? 'op'}`;
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        logger.info(
          { requestId, userId, durationMs: duration, context: 'LoggingInterceptor' },
          `${meta} completed in ${duration}ms`,
        );
      }),
    );
  }
}
