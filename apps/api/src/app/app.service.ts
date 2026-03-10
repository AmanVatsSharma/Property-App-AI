/**
 * @file app.service.ts
 * @module api
 * @description Root service; health message for API.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
