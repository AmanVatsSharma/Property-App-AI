/**
 * @file broker.module.ts
 * @module broker
 * @description Feature module: broker verification request and admin review.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrokerRequest } from './entities/broker-request.entity';
import { BrokerRequestRepository } from './repository/broker-request.repository';
import { BrokerRequestService } from './services/broker-request.service';
import { BrokerRequestResolver } from './resolvers/broker-request.resolver';
import { UserModule } from '@api/modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BrokerRequest]), UserModule],
  providers: [BrokerRequestRepository, BrokerRequestService, BrokerRequestResolver],
})
export class BrokerModule {}
