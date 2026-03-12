/**
 * @file 1735120000000-AddPropertyImageUrls.ts
 * @module database/migrations
 * @description Add coverImageUrl and imageUrls columns to property table for S3 image URLs.
 * @author BharatERP
 * @created 2025-03-12
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyImageUrls1735120000000 implements MigrationInterface {
  name = 'AddPropertyImageUrls1735120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" ADD "coverImageUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" ADD "imageUrls" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "imageUrls"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property" DROP COLUMN "coverImageUrl"`,
    );
  }
}
