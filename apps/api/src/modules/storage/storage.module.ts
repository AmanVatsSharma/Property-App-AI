/**
 * @file storage.module.ts
 * @module storage
 * @description Module for S3 file upload; exposes StorageService and upload REST routes.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service';
import { UploadController } from './controllers/upload.controller';
import { LoggerModule } from '../../shared/logger';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
