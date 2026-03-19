/**
 * @file data-source.ts
 * @module database
 * @description TypeORM DataSource for CLI/migrations. Loads .ts in dev and .js when compiled.
 * @author BharatERP
 * @created 2025-03-15
 */

import { DataSource } from 'typeorm';
import { join } from 'path';

const isCompiled = __filename.endsWith('.js');
const ext = isCompiled ? '.js' : '.ts';
const migrationsGlob = join(__dirname, 'migrations', `*${ext}`);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'property_app',
  migrations: [migrationsGlob],
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
