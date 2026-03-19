/**
 * @file 1736500000000-CreateSavedSearch.ts
 * @module database/migrations
 * @description Create saved_search table for user saved property searches with alert support.
 * @author BharatERP
 * @created 2026-03-19
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSavedSearch1736500000000 implements MigrationInterface {
  name = 'CreateSavedSearch1736500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "saved_search" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "filters" jsonb NOT NULL DEFAULT '{}',
        "alertEnabled" boolean NOT NULL DEFAULT true,
        "lastAlertSentAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_search" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_saved_search_userId" ON "saved_search" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_saved_search_alertEnabled" ON "saved_search" ("alertEnabled")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_saved_search_alertEnabled"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_saved_search_userId"`);
    await queryRunner.query(`DROP TABLE "saved_search"`);
  }
}
