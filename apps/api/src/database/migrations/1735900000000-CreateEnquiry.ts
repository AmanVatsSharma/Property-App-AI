/**
 * @file 1735900000000-CreateEnquiry.ts
 * @module database/migrations
 * @description Create enquiry table for property contact messages.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnquiry1735900000000 implements MigrationInterface {
  name = 'CreateEnquiry1735900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "enquiry" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "propertyId" uuid NOT NULL,
        "fromUserId" uuid NOT NULL,
        "ownerUserId" uuid,
        "message" text NOT NULL,
        "phone" varchar(20),
        "status" varchar(20) NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enquiry" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_enquiry_propertyId" ON "enquiry" ("propertyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_enquiry_fromUserId" ON "enquiry" ("fromUserId")`);
    await queryRunner.query(`CREATE INDEX "IDX_enquiry_ownerUserId" ON "enquiry" ("ownerUserId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enquiry_ownerUserId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enquiry_fromUserId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enquiry_propertyId"`);
    await queryRunner.query(`DROP TABLE "enquiry"`);
  }
}
