/**
 * @file request-id.middleware.ts
 * @module common/middleware
 * @description Sets requestId on request and response for correlation; reads from header or generates UUID.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const HEADER_REQUEST_ID = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = (req.headers[HEADER_REQUEST_ID] as string) ?? randomUUID();
    req.requestId = id;
    res.setHeader(HEADER_REQUEST_ID, id);
    next();
  }
}
