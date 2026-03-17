/**
 * @file 1735600000000-AddPropertyNearbyAmenities.ts
 * @module database/migrations
 * @description Add nearbyAmenities JSONB to property for listing enrichment.
 * @author BharatERP
 * @created 2026-03-17
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyNearbyAmenities1735600000000 implements MigrationInterface {
  name = 'AddPropertyNearbyAmenities1735600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" ADD "nearbyAmenities" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "nearbyAmenities"`);
  }
}
