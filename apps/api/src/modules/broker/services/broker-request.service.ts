/**
 * @file broker-request.service.ts
 * @module broker
 * @description Business logic for broker verification request and admin review.
 * @author BharatERP
 * @created 2026-03-18
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BrokerRequest } from '../entities/broker-request.entity';
import { BrokerRequestRepository } from '../repository/broker-request.repository';
import { UserService } from '@api/modules/user/services/user.service';
import { UserRole } from '@api/modules/user/entities/user.entity';
import { RequestBrokerVerificationInput } from '../dtos/request-broker-verification.input';

@Injectable()
export class BrokerRequestService {
  constructor(
    private readonly brokerRequestRepo: BrokerRequestRepository,
    private readonly userService: UserService,
  ) {}

  async requestBrokerVerification(
    userId: string,
    input?: RequestBrokerVerificationInput,
  ): Promise<BrokerRequest> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.BROKER) {
      throw new ForbiddenException('Already a verified broker');
    }
    const existing = await this.brokerRequestRepo.findByUserId(userId);
    if (existing) {
      if (existing.status === 'pending') return existing;
      if (existing.status === 'approved') throw new ForbiddenException('Already approved as broker');
    }
    return this.brokerRequestRepo.create(userId, input?.documents ?? null);
  }

  async approveBrokerRequest(requestId: string, adminUserId: string): Promise<BrokerRequest> {
    const request = await this.brokerRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Broker request not found');
    if (request.status !== 'pending') {
      throw new ForbiddenException(`Request is already ${request.status}`);
    }
    await this.userService.setRole(request.userId, UserRole.BROKER);
    return this.brokerRequestRepo.updateStatus(requestId, 'approved', adminUserId);
  }

  async rejectBrokerRequest(
    requestId: string,
    adminUserId: string,
    note?: string | null,
  ): Promise<BrokerRequest> {
    const request = await this.brokerRequestRepo.findById(requestId);
    if (!request) throw new NotFoundException('Broker request not found');
    if (request.status !== 'pending') {
      throw new ForbiddenException(`Request is already ${request.status}`);
    }
    return this.brokerRequestRepo.updateStatus(requestId, 'rejected', adminUserId, note ?? null);
  }
}
