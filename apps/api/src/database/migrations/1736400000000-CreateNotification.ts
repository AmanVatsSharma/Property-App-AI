/**
 * @file 1736400000000-CreateNotification.ts
 * @module database/migrations
 * @description Create notification table for in-app notifications (stub; future FCM).
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotification1736400000000 implements MigrationInterface {
  name = 'CreateNotification1736400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "title" varchar(200) NOT NULL,
        "body" text NOT NULL,
        "data" jsonb,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_notification_userId" ON "notification" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notification_readAt" ON "notification" ("readAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_readAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_userId"`);
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
