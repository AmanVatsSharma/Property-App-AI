/**
 * @file 1735700000000-AddCreatedByUserIdAndIndexes.ts
 * @module database/migrations
 * @description Add createdByUserId to property if missing; add performance indexes for property, area, user.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByUserIdAndIndexes1735700000000 implements MigrationInterface {
  name = 'AddCreatedByUserIdAndIndexes1735700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property"
      ADD COLUMN IF NOT EXISTS "createdByUserId" uuid
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_location"
      ON "property" USING gin(to_tsvector('simple', location))
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_price" ON "property" (price)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_bedrooms" ON "property" (bedrooms)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_areaId" ON "property" ("areaId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_createdByUserId" ON "property" ("createdByUserId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_type" ON "property" (type)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_property_createdAt" ON "property" ("createdAt" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_area_localityNormalized_cityNormalized"
      ON "area" ("localityNormalized", "cityNormalized")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_phone" ON "user" (phone)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_location"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_bedrooms"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_areaId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_createdByUserId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_property_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_area_localityNormalized_cityNormalized"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_phone"`);
  }
}
