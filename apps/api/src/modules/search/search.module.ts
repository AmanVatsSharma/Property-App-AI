/**
 * @file search.module.ts
 * @module search
 * @description Module for natural-language search parsing; exports SearchParserService.
 * @author BharatERP
 * @created 2026-03-17
 */

import { Module } from '@nestjs/common';
import { LoggerModule } from '@api/shared/logger';
import { SearchParserService } from './services/search-parser.service';

@Module({
  imports: [LoggerModule],
  providers: [SearchParserService],
  exports: [SearchParserService],
})
export class SearchModule {}
