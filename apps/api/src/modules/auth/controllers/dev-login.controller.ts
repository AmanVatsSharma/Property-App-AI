/**
 * File:        apps/api/src/modules/auth/controllers/dev-login.controller.ts
 * Module:      auth · Dev
 * Purpose:     Single development-only endpoint that issues a real JWT for any
 *              seeded phone number, bypassing OTP. Lets developers log in and
 *              exercise every UI flow immediately after running `npm run seed:dev`.
 *
 * Exports:
 *   - DevLoginController — NestJS controller for POST /dev/login
 *
 * Depends on:
 *   - AuthService (finalizeMobileLogin) — creates/gets user + signs JWT
 *   - ConfigService                     — reads NODE_ENV to hard-reject in production
 *
 * Side-effects:
 *   - Creates the user row if not already present (via getOrCreateByPhone)
 *   - Issues a JWT with the same payload as the real OTP flow
 *
 * Key invariants:
 *   - Throws NotFoundException (404) when NODE_ENV === 'production' — endpoint is
 *     completely inert in production; never mount this controller conditionally
 *     because NestJS's lifecycle makes conditional registration fragile. 404 is safe.
 *   - @Public() means the global AuthGuard skips this route entirely.
 *   - Phone must be a valid 10-digit Indian mobile (delegated to finalizeMobileLogin).
 *
 * Read order:
 *   1. DevLoginController — controller class; one route, one guard.
 *
 * Author:       UrbanNest.ai team
 * Last-updated: 2026-05-07
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '@api/common/decorators/public.decorator';
import { AuthService } from '../services/auth.service';

class DevLoginDto {
  phone!: string;
}

@Controller({ path: 'dev', version: VERSION_NEUTRAL })
@Public()
export class DevLoginController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async devLogin(@Body() body: DevLoginDto) {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }

    const phone = String(body.phone ?? '').replace(/\D/g, '').slice(-10);
    return this.auth.finalizeMobileLogin(phone);
  }
}
