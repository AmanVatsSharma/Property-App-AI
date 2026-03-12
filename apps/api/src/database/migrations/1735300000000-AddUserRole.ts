/**
 * @file 1735300000000-AddUserRole.ts
 * @module database/migrations
 * @description Add role column to user table for admin panel access.
 * @author BharatERP
 * @created 2025-03-13
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1735300000000 implements MigrationInterface {
  name = 'AddUserRole1735300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying(20) NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }
}
