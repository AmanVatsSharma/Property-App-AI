/**
 * @file 1735200000000-AddPropertyLatLng.ts
 * @module database/migrations
 * @description Add latitude and longitude columns to property table for map display.
 * @author BharatERP
 * @created 2025-03-13
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyLatLng1735200000000 implements MigrationInterface {
  name = 'AddPropertyLatLng1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" ADD "latitude" decimal(11,8)`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "longitude" decimal(11,8)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "longitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "latitude"`,
    );
  }
}
