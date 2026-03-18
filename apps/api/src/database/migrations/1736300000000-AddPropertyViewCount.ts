/**
 * @file 1736300000000-AddPropertyViewCount.ts
 * @module database/migrations
 * @description Add viewCount column to property for view tracking.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyViewCount1736300000000 implements MigrationInterface {
  name = 'AddPropertyViewCount1736300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property" ADD "viewCount" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "viewCount"`);
  }
}
