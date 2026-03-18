/**
 * @file 1736200000000-CreateBrokerRequest.ts
 * @module database/migrations
 * @description Create broker_request table for broker verification flow.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBrokerRequest1736200000000 implements MigrationInterface {
  name = 'CreateBrokerRequest1736200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "broker_request" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "documents" jsonb,
        "adminNote" text,
        "reviewedAt" TIMESTAMP,
        "reviewedByUserId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_broker_request" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_broker_request_userId" UNIQUE ("userId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "broker_request"`);
  }
}
