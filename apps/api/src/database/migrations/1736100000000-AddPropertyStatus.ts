/**
 * @file 1736100000000-AddPropertyStatus.ts
 * @module database/migrations
 * @description Set default status for property table.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyStatus1736100000000 implements MigrationInterface {
  name = 'AddPropertyStatus1736100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property"
      ALTER COLUMN "status" SET DEFAULT 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property"
      ALTER COLUMN "status" DROP DEFAULT
    `);
  }
}
