/**
 * File:        apps/api/src/modules/admin/entities/audit-log.entity.ts
 * Module:      admin · Entities
 * Purpose:     Audit log entry for all admin actions — property updates, broker verifications,
 *              role changes, etc. Persisted to the `audit_log` table.
 *
 * Exports:
 *   - AuditLog               — TypeORM entity for audit_log table
 *   - AuditAction            — discriminated union of all trackable admin actions
 *
 * Depends on:
 *   - @api/modules/user/entities/user.entity — UserRole
 *
 * Side-effects:  writes to audit_log table on every tracked admin action
 *
 * Key invariants:
 *   - actorId is always present; anonymous actions are not stored
 *   - changes is JSON-serialized diff (null for delete operations)
 *   - targetType + targetId form a composite reference to the affected resource
 *
 * Read order:
 *   1. AuditAction        — union of valid action labels (start here to understand scope)
 *   2. AuditLog            — entity definition
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '@api/modules/user/entities/user.entity';

/** Every admin action type that is audited. */
export type AuditAction =
  | 'property_update'
  | 'property_delete'
  | 'broker_verify'
  | 'broker_reject'
  | 'user_role_change'
  | 'enquiry_response';

@Entity('audit_log')
@Index(['actorId'])
@Index(['action'])
@Index(['targetType', 'targetId'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Admin user who performed the action. */
  @Column({ type: 'uuid' })
  actorId!: string;

  /** Role of the actor at the time of the action. */
  @Column({ type: 'varchar', length: 20 })
  actorRole!: UserRole;

  /** Action label — which operation was performed. */
  @Column({ type: 'varchar', length: 50 })
  action!: AuditAction;

  /** Type of entity affected (e.g. property, broker, user, enquiry). */
  @Column({ type: 'varchar', length: 30 })
  targetType!: string;

  /** UUID of the affected entity. */
  @Column({ type: 'uuid' })
  targetId!: string;

  /**
   * JSON-serialized diff of changes made.
   * For property_update: { status: { from: 'active', to: 'archived' } }
   * For user_role_change: { role: { from: 'user', to: 'broker' } }
   * null for delete operations.
   */
  @Column({ type: 'jsonb', nullable: true })
  changes!: Record<string, unknown> | null;

  /** IP address of the request that triggered the action. */
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  /** User-Agent header of the request. */
  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}