/**
 * @file graphql-throttler.guard.ts
 * @module common/guards
 * @description Extends ThrottlerGuard so rate limiting reads req/res from GraphQL context (default guard uses HTTP switch only).
 * @author BharatERP
 * @created 2026-03-26
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

@Injectable()
export class GraphqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    const type = context.getType<string>();
    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext<{
        req: Request;
        res?: Response;
      }>();
      const req = gqlCtx.req;
      const res = gqlCtx.res ?? (req as Request & { res?: Response }).res;
      if (!req || !res) {
        return super.getRequestResponse(context) as { req: Request; res: Response };
      }
      return { req, res };
    }
    return super.getRequestResponse(context) as { req: Request; res: Response };
  }
}
