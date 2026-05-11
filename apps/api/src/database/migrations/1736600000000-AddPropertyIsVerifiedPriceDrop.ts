/**
 * @file 1736600000000-AddPropertyIsVerifiedPriceDrop.ts
 * @module database/migrations
 * @description Add isVerified and priceDropPercent columns to property table.
 * @author BharatERP
 * @created 2026-04-10
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyIsVerifiedPriceDrop1736600000000 implements MigrationInterface {
  name = 'AddPropertyIsVerifiedPriceDrop1736600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property" ADD "isVerified" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "property" ADD "priceDropPercent" decimal(5,2) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "priceDropPercent"`);
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "isVerified"`);
  }
}
