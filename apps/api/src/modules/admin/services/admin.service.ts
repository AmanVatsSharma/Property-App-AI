/**
 * @file admin.service.ts
 * @module admin
 * @description Admin service - business logic for platform owner operations
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Property } from '@api/modules/property/entities/property.entity';
import { User, UserRole } from '@api/modules/user/entities/user.entity';
import { BrokerRequest } from '@api/modules/broker/entities/broker-request.entity';
import { Enquiry } from '@api/modules/enquiry/entities/enquiry.entity';
import { LoggerService } from '@api/shared/logger';
import { MetricsService } from '@api/modules/metrics/services/metrics.service';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';
import {
  StatsResponse,
  PropertyStatus,
  BrokerStatus,
  EnquiryStatus,
  PropertyListQuery,
  UserListQuery,
  BrokerVerificationQuery,
  AIMetricsQuery,
  AuditLogQuery,
} from '../dtos/admin-rest.dto';

@Injectable()
export class AdminService {
  private readonly adminActorId = 'system';

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(BrokerRequest)
    private readonly brokerRepo: Repository<BrokerRequest>,
    @InjectRepository(Enquiry)
    private readonly enquiryRepo: Repository<Enquiry>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
    private readonly auditService: AuditService,
  ) {}

  async getStats(): Promise<StatsResponse> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [
      propertyCount,
      userCount,
      brokerCount,
      enquiryCount,
      todayNewUsers,
      todayNewProperties,
      pendingBrokers,
      aiMetrics,
    ] = await Promise.all([
      this.propertyRepo.count(),
      this.userRepo.count(),
      this.brokerRepo.count(),
      this.enquiryRepo.count(),
      this.userRepo.count({
        where: { createdAt: Between(startOfToday, endOfToday) },
      }),
      this.propertyRepo.count({
        where: { createdAt: Between(startOfToday, endOfToday) },
      }),
      this.brokerRepo.count({ where: { status: BrokerStatus.PENDING } }),
      this.getAIMetrics({ startDate: startOfToday.toISOString() }),
    ]);

    return {
      propertyCount,
      userCount,
      brokerCount,
      enquiryCount,
      todayNewUsers,
      todayNewProperties,
      pendingBrokers,
      aiQueriesToday: aiMetrics.totalQueries,
      aiTokenUsageToday: aiMetrics.totalTokens,
      avgResponseTimeMs: aiMetrics.avgResponseTime,
    };
  }

  async getProperties(query: PropertyListQuery): Promise<{ data: Property[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const qb = this.propertyRepo.createQueryBuilder('property');

    if (query.status) {
      qb.andWhere('property.status = :status', { status: query.status });
    }

    if (query.city) {
      qb.andWhere('property.city ILIKE :city', { city: `%${query.city}%` });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('property.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('property.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.type) {
      qb.andWhere('property.type = :type', { type: query.type });
    }

    if (query.createdAfter) {
      qb.andWhere('property.createdAt >= :createdAfter', {
        createdAfter: new Date(query.createdAfter),
      });
    }

    if (query.createdBefore) {
      qb.andWhere('property.createdAt <= :createdBefore', {
        createdBefore: new Date(query.createdBefore),
      });
    }

    qb.orderBy('property.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async updatePropertyStatus(id: string, status: PropertyStatus, reason?: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({ where: { id } });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    property.status = status;
    await this.propertyRepo.save(property);

    this.logger.log('Property status updated', {
      propertyId: id,
      newStatus: status,
      reason,
    });

    return property;
  }

  async getUsers(query: UserListQuery): Promise<{ data: User[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const qb = this.userRepo.createQueryBuilder('user');

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.registeredAfter) {
      qb.andWhere('user.createdAt >= :registeredAfter', {
        registeredAfter: new Date(query.registeredAfter),
      });
    }

    qb.orderBy('user.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async getBrokers(query: BrokerVerificationQuery): Promise<{ data: BrokerRequest[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const qb = this.brokerRepo.createQueryBuilder('broker');

    if (query.status) {
      qb.andWhere('broker.status = :status', { status: query.status });
    }

    qb.orderBy('broker.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async verifyBroker(id: string, status: BrokerStatus, reason?: string, reraVerified?: string): Promise<BrokerRequest> {
    const broker = await this.brokerRepo.findOne({ where: { id } });

    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    broker.status = status;
    if (reraVerified) {
      // Store in adminNote as JSON
      broker.adminNote = JSON.stringify({ reraId: reraVerified, verifiedAt: new Date() });
    }
    await this.brokerRepo.save(broker);

    this.logger.log('Broker verification updated', {
      brokerId: id,
      newStatus: status,
      reason,
      reraVerified,
    });

    return broker;
  }

  async getEnquiries(
    limit = 20,
    offset = 0,
    status?: EnquiryStatus
  ): Promise<{ data: Enquiry[]; total: number }> {
    const qb = this.enquiryRepo.createQueryBuilder('enquiry');

    if (status) {
      qb.andWhere('enquiry.status = :status', { status });
    }

    qb.orderBy('enquiry.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async updateEnquiryStatus(id: string, status: EnquiryStatus, notes?: string): Promise<Enquiry> {
    const enquiry = await this.enquiryRepo.findOne({ where: { id } });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    enquiry.status = status;
    // Notes are logged rather than stored (entity doesn't have notes field)
    if (notes) {
      this.logger.debug('Enquiry status updated', { enquiryId: id, status, notes });
    }
    await this.enquiryRepo.save(enquiry);

    return enquiry;
  }

  async getAIMetrics(query: AIMetricsQuery): Promise<{
    totalQueries: number;
    totalTokens: number;
    avgResponseTime: number;
    queriesByDay: Array<{ date: string; count: number; tokens: number }>;
    topTools: Array<{ tool: string; count: number }>;
    errorRate: number;
    costByProvider: Array<{ provider: string; cost: number; tokens: number }>;
  }> {
    const snapshot = await this.metricsService.getMetricsSnapshot();

    // Aggregate total LLM tokens from all feature:provider:token_type keys
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const byProvider: Record<string, number> = {};
    for (const [key, count] of Object.entries(snapshot.llmTokens)) {
      const [feature, provider, tokenType] = key.split(':');
      if (tokenType === 'input') totalInputTokens += count;
      else if (tokenType === 'output') totalOutputTokens += count;
      byProvider[provider] = (byProvider[provider] ?? 0) + count;
    }
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Aggregate agent call counts (status: success|error|stub)
    let totalQueries = 0;
    for (const [, count] of Object.entries(snapshot.agentCalls)) {
      totalQueries += count;
    }

    // Estimated cost: Google Gemini flash rate ~$0.001/1K tokens (input+output combined)
    const estimatedCostUsd = (totalTokens / 1000) * 0.001;

    // Provider breakdown
    const costByProvider = Object.entries(byProvider).map(([provider, tokens]) => ({
      provider,
      tokens,
      cost: (tokens / 1000) * 0.001,
      fraction: tokens / totalTokens || 0,
    }));

    return {
      totalQueries,
      totalTokens,
      avgResponseTime: 0, // histogram requires histogram.get() — defer to Prometheus scrape
      queriesByDay: [],
      topTools: [],
      errorRate: 0,
      costByProvider,
    };
  }

  async getAuditLogs(query: AuditLogQuery): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditService.getAuditLogs(query);
  }

  async setUserRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    await this.userRepo.save(user);

    this.logger.log('User role updated', { userId, newRole: role });

    return user;
  }
}