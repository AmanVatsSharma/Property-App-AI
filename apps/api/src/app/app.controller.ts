/**
 * @file app.controller.ts
 * @module api
 * @description Root HTTP controller; health/status endpoint.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
