/**
 * File:        apps/api/src/modules/admin/services/audit.service.ts
 * Module:      admin · Services
 * Purpose:     Persists audit log entries for all admin actions. Also queries audit_log table.
 *
 * Exports:
 *   - AuditService              — inject into AdminController/AdminService for logging
 *   - logAudit(...)             — async write of one audit entry
 *   - getAuditLogs(query)       — paginated, filterable audit log query
 *
 * Depends on:
 *   - @api/modules/admin/entities/audit-log.entity — AuditLog entity
 *   - @api/shared/logger — LoggerService
 *
 * Side-effects:  writes to audit_log table; reads it for getAuditLogs
 *
 * Key invariants:
 *   - actorId is required; always pass the authenticated admin's id
 *   - ipAddress/userAgent are optional — controller extracts from Request headers
 *
 * Read order:
 *   1. AuditService              — entry point for logging
 *   2. getAuditLogs             — query interface
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { LoggerService } from '@api/shared/logger';
import type { UserRole } from '@api/modules/user/entities/user.entity';

export interface AuditLogEntry {
  actorId: string;
  actorRole: UserRole;
  action: AuditAction;
  targetType: string;
  targetId: string;
  changes: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Persist one audit log entry.
   * Call this at the end of every AdminService mutation (property status change, broker verify, etc.).
   */
  async logAudit(entry: AuditLogEntry): Promise<void> {
    try {
      const record = this.auditRepo.create(entry);
      await this.auditRepo.save(record);
      this.logger.debug('Audit log written', {
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
      });
    } catch (err) {
      // Audit failures must not break the primary operation — log and continue.
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to write audit log', { error: message, entry });
    }
  }

  /**
   * Paginated, filterable query of audit logs.
   * Used by GET /admin/audit-logs.
   */
  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const qb = this.auditRepo.createQueryBuilder('audit');
    if (query.action) {
      qb.andWhere('audit.action = :action', { action: query.action });
    }
    if (query.userId) {
      qb.andWhere('audit.actorId = :userId', { userId: query.userId });
    }
    qb.orderBy('audit.createdAt', 'DESC').skip(offset).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}