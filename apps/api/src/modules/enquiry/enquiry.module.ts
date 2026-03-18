/**
 * @file enquiry.module.ts
 * @module enquiry
 * @description Feature module: property enquiries (buyer messages to seller).
 * @author BharatERP
 * @created 2026-03-18
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from './entities/enquiry.entity';
import { EnquiryRepository } from './repository/enquiry.repository';
import { EnquiryService } from './services/enquiry.service';
import { EnquiryResolver } from './resolvers/enquiry.resolver';
import { PropertyModule } from '@api/modules/property/property.module';
import { UserModule } from '@api/modules/user/user.module';
import { NotificationModule } from '@api/modules/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry]), PropertyModule, UserModule, NotificationModule],
  providers: [EnquiryRepository, EnquiryService, EnquiryResolver],
})
export class EnquiryModule {}
