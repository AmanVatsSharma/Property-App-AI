/**
 * @file admin.module.ts
 * @module admin
 * @description Admin-only GraphQL queries: users list and dashboard stats; protected by AdminGuard.
 * @author BharatERP
 * @created 2025-03-13
 */

import { Module } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UserModule } from '../user/user.module';
import { PropertyModule } from '../property/property.module';
import { AdminResolver } from './resolvers/admin.resolver';

@Module({
  imports: [UserModule, PropertyModule],
  providers: [AdminGuard, AdminResolver],
})
export class AdminModule {}
