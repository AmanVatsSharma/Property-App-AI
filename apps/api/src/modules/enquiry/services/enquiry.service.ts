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
import { NotificationService } from '@api/modules/notification/services/notification.service';
import { CreateEnquiryInput } from '../dtos/create-enquiry.input';

@Injectable()
export class EnquiryService {
  constructor(
    private readonly enquiryRepo: EnquiryRepository,
    private readonly propertyService: PropertyService,
    private readonly notificationService: NotificationService,
  ) {}

  async send(fromUserId: string, input: CreateEnquiryInput): Promise<Enquiry> {
    const property = await this.propertyService.findOne(input.propertyId);
    const ownerUserId = property.createdByUserId ?? null;
    const enquiry = await this.enquiryRepo.create({
      propertyId: input.propertyId,
      fromUserId,
      ownerUserId,
      message: input.message,
      phone: input.phone ?? null,
    });
    if (ownerUserId) {
      const body = input.message.length > 100 ? input.message.slice(0, 97) + '...' : input.message;
      this.notificationService
        .create(ownerUserId, 'enquiry', 'New enquiry', body, {
          enquiryId: enquiry.id,
          propertyId: input.propertyId,
        })
        .catch(() => {});
    }
    return enquiry;
  }

  async myReceived(ownerUserId: string): Promise<Enquiry[]> {
    return this.enquiryRepo.findByOwnerUserId(ownerUserId);
  }

  async mySent(fromUserId: string): Promise<Enquiry[]> {
    return this.enquiryRepo.findByFromUserId(fromUserId);
  }

  async updateStatus(
    id: string,
    status: string,
    requestingUserId: string,
  ): Promise<Enquiry | null> {
    const enquiry = await this.enquiryRepo.findById(id);
    if (!enquiry) return null;
    if (enquiry.ownerUserId !== requestingUserId) return null;
    return this.enquiryRepo.updateStatus(id, status);
  }
}
