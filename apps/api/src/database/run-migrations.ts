/**
 * @file run-migrations.ts
 * @module database
 * @description Runnable script: loads env (root .env then apps/api/.env), initializes DataSource, runs pending migrations.
 * @author BharatERP
 * @created 2025-03-15
 * @updated 2026-03-26 Replace console.log/error with NestJS Logger for consistent structured output.
 */

import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { join } from 'path';
import { AppDataSource } from './data-source';

const logger = new Logger('Migrations');

const cwd = process.cwd();
// Same order as ConfigModule: root .env first, then app .env so app overrides.
const isApiCwd = cwd.endsWith('apps/api') || cwd.endsWith('apps\\api');
const rootEnv = isApiCwd ? join(cwd, '..', '..', '.env') : join(cwd, '.env');
const apiEnv = isApiCwd ? join(cwd, '.env') : join(cwd, 'apps', 'api', '.env');
config({ path: rootEnv });
config({ path: apiEnv });

async function run(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const executed = await AppDataSource.runMigrations();
    if (executed.length > 0) {
      logger.log(`Ran ${executed.length} migration(s): ${executed.map((m) => m.name).join(', ')}`);
    } else {
      logger.log('No pending migrations.');
    }
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((err: unknown) => {
  logger.error('Migration failed', err instanceof Error ? err.stack : String(err));
  process.exit(1);
});
