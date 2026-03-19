/**
 * @file 1733900000000-CreateUser.ts
 * @module database/migrations
 * @description Base user table — must run before AddUserRole patch.
 * @author BharatERP
 * @created 2025-03-19
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1733900000000 implements MigrationInterface {
  name = 'CreateUser1733900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id"          uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "phone"       varchar(20)   NOT NULL,
        "displayName" varchar(200),
        "role"        varchar(20)   NOT NULL DEFAULT 'user',
        "createdAt"   TIMESTAMP     NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user"       PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_phone" UNIQUE ("phone")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
