/**
 * @file storage.service.ts
 * @module storage
 * @description S3 upload service; validates image type/size and returns public URL.
 * @author BharatERP
 * @created 2025-03-12
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LoggerService } from '../../shared/logger';
import { randomUUID } from 'crypto';

const ALLOWED_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class StorageService {
  private readonly s3: S3Client | null = null;
  private readonly bucket: string | null = null;
  private readonly region: string;
  private readonly publicBaseUrl: string | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.region = this.config.get<string>('AWS_REGION') ?? 'us-east-1';
    const bucket = this.config.get<string>('S3_BUCKET');
    if (bucket) {
      this.bucket = bucket;
      const accessKey = this.config.get<string>('AWS_ACCESS_KEY_ID');
      const secretKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
      this.s3 = new S3Client({
        region: this.region,
        ...(accessKey && secretKey
          ? { credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } }
          : {}),
      });
      this.publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL') ?? null;
    }
  }

  isConfigured(): boolean {
    return this.s3 !== null && this.bucket !== null;
  }

  private validateFile(buffer: Buffer, contentType: string, size: number): void {
    if (!ALLOWED_MIMES.has(contentType)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${[...ALLOWED_MIMES].join(', ')}`,
      );
    }
    if (size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large. Max size: ${MAX_SIZE_BYTES / 1024 / 1024} MB`,
      );
    }
  }

  private buildKey(contentType: string): string {
    const date = new Date().toISOString().slice(0, 10);
    const ext = contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/png' ? 'png' : 'webp';
    return `uploads/${date}/${randomUUID()}.${ext}`;
  }

  private buildPublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      const base = this.publicBaseUrl.replace(/\/$/, '');
      return `${base}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async uploadFile(
    buffer: Buffer,
    contentType: string,
    size: number,
    requestId?: string,
  ): Promise<string> {
    this.validateFile(buffer, contentType, size);
    if (!this.s3 || !this.bucket) {
      throw new BadRequestException('Storage (S3) is not configured');
    }
    const key = this.buildKey(contentType);
    this.logger.debug('StorageService.uploadFile entry', {
      key,
      size,
      requestId,
    });
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      const url = this.buildPublicUrl(key);
      this.logger.debug('StorageService.uploadFile exit', { key, url, requestId });
      return url;
    } catch (err) {
      this.logger.error(
        'StorageService.uploadFile S3 error',
        (err as Error).stack,
        { key, requestId },
      );
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Upload failed',
      );
    }
  }
}
