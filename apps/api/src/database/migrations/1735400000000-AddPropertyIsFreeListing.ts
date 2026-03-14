import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyIsFreeListing1735400000000 implements MigrationInterface {
  name = 'AddPropertyIsFreeListing1735400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" ADD "isFreeListing" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "isFreeListing"`);
  }
}
