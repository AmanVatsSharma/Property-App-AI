/**
 * @file 1735500000000-AddPropertyAreaLink.ts
 * @module database/migrations
 * @description Add areaId, locality, city to property for area-based search and listing enrichment.
 * @author BharatERP
 * @created 2026-03-17
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyAreaLink1735500000000 implements MigrationInterface {
  name = 'AddPropertyAreaLink1735500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" ADD "areaId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "locality" varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "city" varchar(200)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "locality"`);
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "areaId"`);
  }
}
