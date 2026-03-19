/**
 * @file 1734000000000-CreateUser.ts
 * @module database/migrations
 * @description Create user table (id, phone, displayName, role, createdAt, updatedAt). Base table for auth; later migrations add role, indexes.
 * @author BharatERP
 * @created 2025-03-19
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1734000000000 implements MigrationInterface {
  name = 'CreateUser1734000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "phone" character varying(20) NOT NULL,
        "displayName" character varying(200),
        "role" character varying(20) NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_phone" UNIQUE ("phone")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
