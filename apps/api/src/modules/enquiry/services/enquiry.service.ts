/**
 * @file enquiry.service.ts
 * @module enquiry
 * @description Business logic for sending and listing enquiries.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { Enquiry } from '../entities/enquiry.entity';
import { EnquiryRepository } from '../repository/enquiry.repository';
import { PropertyService } from '@api/modules/property/services/property.service';
import { CreateEnquiryInput } from '../dtos/create-enquiry.input';

@Injectable()
export class EnquiryService {
  constructor(
    private readonly enquiryRepo: EnquiryRepository,
    private readonly propertyService: PropertyService,
  ) {}

  async send(fromUserId: string, input: CreateEnquiryInput): Promise<Enquiry> {
    const property = await this.propertyService.findOne(input.propertyId);
    const ownerUserId = property.createdByUserId ?? null;
    return this.enquiryRepo.create({
      propertyId: input.propertyId,
      fromUserId,
      ownerUserId,
      message: input.message,
      phone: input.phone ?? null,
    });
  }

  async myReceived(ownerUserId: string): Promise<Enquiry[]> {
    return this.enquiryRepo.findByOwnerUserId(ownerUserId);
  }

  async mySent(fromUserId: string): Promise<Enquiry[]> {
    return this.enquiryRepo.findByFromUserId(fromUserId);
  }
}
