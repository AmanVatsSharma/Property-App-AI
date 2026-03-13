/**
 * @file upload.controller.ts
 * @module storage
 * @description REST controller for image upload; single and multiple file upload to S3.
 * @author BharatERP
 * @created 2025-03-13
 */

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { StorageService } from '../storage.service';

const FIELD_SINGLE = 'file';
const FIELD_MULTIPLE = 'files';
const MAX_FILES = 10;

@Controller('api/v1')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor(FIELD_SINGLE))
  async uploadOne(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request & { requestId?: string },
  ): Promise<{ url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException(`Missing form field: ${FIELD_SINGLE}`);
    }
    const url = await this.storage.uploadFile(
      file.buffer,
      file.mimetype ?? 'application/octet-stream',
      file.size,
      req.requestId,
    );
    return { url };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor(FIELD_MULTIPLE, MAX_FILES))
  async uploadMultiple(
    @UploadedFiles() files: (Express.Multer.File | undefined)[] | undefined,
    @Req() req: Request & { requestId?: string },
  ): Promise<{ urls: string[] }> {
    const list = Array.isArray(files) ? files.filter((f): f is Express.Multer.File => Boolean(f?.buffer)) : [];
    if (list.length === 0) {
      throw new BadRequestException(`Missing or empty form field: ${FIELD_MULTIPLE}`);
    }
    const urls: string[] = [];
    for (const file of list) {
      const url = await this.storage.uploadFile(
        file.buffer,
        file.mimetype ?? 'application/octet-stream',
        file.size,
        req.requestId,
      );
      urls.push(url);
    }
    return { urls };
  }
}
