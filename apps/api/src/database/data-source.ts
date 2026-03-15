/**
 * @file data-source.ts
 * @module database
 * @description TypeORM DataSource for CLI/migrations. Uses DB_* env; migrations in apps/api/src/database/migrations.
 * @author BharatERP
 * @created 2025-03-15
 */

import { readdirSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

const migrationsDir = join(__dirname, 'migrations');
const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => join(migrationsDir, f));

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'property_app',
  migrations: migrationFiles,
  migrationsTableName: 'typeorm_migrations',
});
