/**
 * @file 1735300000000-CreateArea.ts
 * @module database/migrations
 * @description Create area table for region assessment (locality/city with scores).
 * @author BharatERP
 * @created 2025-03-13
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArea1735300000000 implements MigrationInterface {
  name = 'CreateArea1735300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "area" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "locality" character varying(200) NOT NULL,
        "city" character varying(200) NOT NULL DEFAULT '',
        "localityNormalized" character varying(250) NOT NULL,
        "cityNormalized" character varying(250) NOT NULL,
        "livabilityScore" integer,
        "priceTrendPctAnnual" numeric(6,2),
        "connectivityScore" integer,
        "schoolsScore" integer,
        "safetyScore" integer,
        "amenitiesSummary" text,
        "dataSource" character varying(50),
        "lastAssessedAt" TIMESTAMP,
        "latitude" numeric(11,8),
        "longitude" numeric(11,8),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_area" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_area_locality_city" UNIQUE ("localityNormalized", "cityNormalized")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "area"`);
  }
}
