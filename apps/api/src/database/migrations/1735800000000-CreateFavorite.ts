/**
 * @file 1735800000000-CreateFavorite.ts
 * @module database/migrations
 * @description Create favorite table for user saved properties.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavorite1735800000000 implements MigrationInterface {
  name = 'CreateFavorite1735800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "favorite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "propertyId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorite" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorite_user_property" UNIQUE ("userId", "propertyId")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_favorite_userId" ON "favorite" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_favorite_propertyId" ON "favorite" ("propertyId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_favorite_propertyId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_favorite_userId"`);
    await queryRunner.query(`DROP TABLE "favorite"`);
  }
}
