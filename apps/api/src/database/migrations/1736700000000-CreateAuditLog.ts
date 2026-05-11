/**
 * File:        apps/api/src/database/migrations/1736700000000-CreateAuditLog.ts
 * Module:      database/migrations
 * Purpose:     Create audit_log table for tracking all admin platform operations.
 *              Mirrors the AuditLog entity in @api/modules/admin/entities/audit-log.entity.
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1736700000000 implements MigrationInterface {
  name = 'CreateAuditLog1736700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id"          uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "actorId"     uuid          NOT NULL,
        "actorRole"   varchar(20)   NOT NULL,
        "action"      varchar(50)   NOT NULL,
        "targetType"  varchar(30)   NOT NULL,
        "targetId"    uuid          NOT NULL,
        "changes"     jsonb,
        "ipAddress"   varchar(45),
        "userAgent"   varchar(512),
        "createdAt"   timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log"   PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_actorId"    ON "audit_log" ("actorId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_action"     ON "audit_log" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_target"     ON "audit_log" ("targetType", "targetId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_createdAt"  ON "audit_log" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}