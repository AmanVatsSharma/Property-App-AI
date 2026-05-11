/**
 * @file admin.module.ts
 * @module admin
 * @description Admin module: GraphQL queries for admin + REST API for owner dashboard.
 * GraphQL: users list, stats, setUserRole (protected by AdminGuard).
 * REST: /admin/* endpoints for platform owner dashboard.
 * @author BharatERP
 * @created 2025-03-13
 * @updated 2026-05-11 — Added REST controller for owner dashboard
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from '@api/common/guards/admin.guard';
import { UserModule } from '@api/modules/user/user.module';
import { PropertyModule } from '@api/modules/property/property.module';
import { MetricsModule } from '@api/modules/metrics/metrics.module';
import { AdminResolver } from './resolvers/admin.resolver';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AuditService } from './services/audit.service';
import { User } from '@api/modules/user/entities/user.entity';
import { Property } from '@api/modules/property/entities/property.entity';
import { BrokerRequest } from '@api/modules/broker/entities/broker-request.entity';
import { Enquiry } from '@api/modules/enquiry/entities/enquiry.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    UserModule,
    PropertyModule,
    TypeOrmModule.forFeature([User, Property, BrokerRequest, Enquiry, AuditLog]),
    MetricsModule,
  ],
  controllers: [AdminController],
  providers: [AdminGuard, AdminResolver, AdminService, AuditService],
  exports: [AdminService],
})
export class AdminModule {}
