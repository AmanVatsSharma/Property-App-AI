/**
 * @file health.module.ts
 * @module health
 * @description Health check feature module (Terminus, TypeORM).
 * @author BharatERP
 * @created 2025-03-10
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
