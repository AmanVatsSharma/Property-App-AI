/**
 * @file enquiry.repository.ts
 * @module enquiry
 * @description Data access for Enquiry entity.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from '../entities/enquiry.entity';

@Injectable()
export class EnquiryRepository {
  constructor(
    @InjectRepository(Enquiry)
    private readonly repo: Repository<Enquiry>,
  ) {}

  async findById(id: string): Promise<Enquiry | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByPropertyId(propertyId: string): Promise<Enquiry[]> {
    return this.repo.find({ where: { propertyId }, order: { createdAt: 'DESC' } });
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Enquiry[]> {
    return this.repo.find({ where: { ownerUserId }, order: { createdAt: 'DESC' } });
  }

  async findByFromUserId(fromUserId: string): Promise<Enquiry[]> {
    return this.repo.find({ where: { fromUserId }, order: { createdAt: 'DESC' } });
  }

  async create(data: {
    propertyId: string;
    fromUserId: string;
    ownerUserId: string | null;
    message: string;
    phone?: string | null;
  }): Promise<Enquiry> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async updateStatus(id: string, status: string): Promise<Enquiry | null> {
    const enquiry = await this.repo.findOne({ where: { id } });
    if (!enquiry) return null;
    enquiry.status = status;
    return this.repo.save(enquiry);
  }
}
