/**
 * File:        apps/api/src/database/data-source.ts
 * Module:      database
 * Purpose:     TypeORM DataSource for the CLI migration tool (`npx nx run api:migration:*`).
 *              Always targets PostgreSQL — migrations are production artifacts and should never
 *              be authored against SQLite. Dev SQLite uses `synchronize: true` instead.
 *
 * Exports:
 *   - AppDataSource — DataSource instance for TypeORM CLI
 *
 * Side-effects:   none at import time; connects only when `.initialize()` is called by CLI
 *
 * Key invariants:
 *   - This file is ONLY used by the TypeORM CLI, not by the running NestJS app.
 *   - NestJS app uses TypeOrmModule.forRootAsync() in app.module.ts (supports sqlite + postgres).
 *   - Migrations are always PostgreSQL DDL — never run them against SQLite.
 *
 * Read order:
 *   1. AppDataSource constructor — connection params + globs for entities/migrations
 *
 * Author:       BharatERP
 * Last-updated: 2026-05-07
 */

import { DataSource } from 'typeorm';
import { join } from 'path';

const isCompiled = __filename.endsWith('.js');
const ext = isCompiled ? '.js' : '.ts';
const migrationsGlob = join(__dirname, 'migrations', `*${ext}`);
const entitiesGlob = join(__dirname, '..', 'modules', '**', 'entities', `*${ext}`);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'property_app',
  entities: [entitiesGlob],
  migrations: [migrationsGlob],
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
