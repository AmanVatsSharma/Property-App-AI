/**
 * @file 1736000000000-CreateAgentConversation.ts
 * @module database/migrations
 * @description Create agent_conversation table for persisting agent chat sessions.
 * @author BharatERP
 * @created 2026-03-18
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgentConversation1736000000000 implements MigrationInterface {
  name = 'CreateAgentConversation1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "agent_conversation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "title" varchar(200),
        "messages" jsonb NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agent_conversation" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_agent_conversation_userId" ON "agent_conversation" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_conversation_userId"`);
    await queryRunner.query(`DROP TABLE "agent_conversation"`);
  }
}
