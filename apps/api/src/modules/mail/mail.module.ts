/**
 * @file mail.module.ts
 * @module mail
 * @description Global mail module: SMTP delivery via MailService; stub when unconfigured.
 * @author BharatERP
 * @created 2026-03-19
 */

import { Global, Module } from '@nestjs/common';
import { LoggerModule } from '@api/shared/logger';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
