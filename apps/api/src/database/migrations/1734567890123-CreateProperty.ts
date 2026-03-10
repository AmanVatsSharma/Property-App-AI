/**
 * @file 1734567890123-CreateProperty.ts
 * @module database/migrations
 * @description Initial migration: create property table.
 * @author BharatERP
 * @created 2025-03-10
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProperty1734567890123 implements MigrationInterface {
  name = 'CreateProperty1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "property" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "location" character varying NOT NULL,
        "price" numeric(14,2) NOT NULL,
        "type" character varying NOT NULL DEFAULT 'apartment',
        "bedrooms" integer NOT NULL DEFAULT 0,
        "bathrooms" integer NOT NULL DEFAULT 0,
        "areaSqft" numeric(10,2),
        "status" character varying,
        "listingFor" character varying,
        "specs" text,
        "aiTip" text,
        "aiScore" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "property"`);
  }
}
