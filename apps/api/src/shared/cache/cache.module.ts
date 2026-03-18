/**
 * @file cache.module.ts
 * @module shared/cache
 * @description Provides CacheService (Redis-backed); used by PropertyModule for findOne cache.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
