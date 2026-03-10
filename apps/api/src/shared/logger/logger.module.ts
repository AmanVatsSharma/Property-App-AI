/**
 * @file logger.module.ts
 * @module shared/logger
 * @description Exposes LoggerService for injection across the app.
 * @author BharatERP
 * @created 2025-03-10
 */

import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
