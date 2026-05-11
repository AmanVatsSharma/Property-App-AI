/**
 * @file refresh-token.service.ts
 * @module auth
 * @description Issues, validates, and rotates opaque refresh tokens for JWT-free session persistence.
 * Uses crypto.randomBytes for token generation; tokens stored directly on the User entity (DB-backed rotation).
 *
 * Exports:
 *   - generateRefreshToken(userId) → string  — creates a new opaque token and stores hash on user
 *   - validateRefreshToken(userId, token) → boolean  — checks token matches stored hash
 *   - revokeRefreshToken(userId) → Promise<void>  — clears stored hash (logout)
 *
 * Depends on:
 *   - @/modules/user/services/user.service — updateRefreshToken
 *
 * Side-effects:
 *   - DB write on token generation and revocation
 *
 * Key invariants:
 *   - Tokens are stored as SHA-256 hashes; raw token never stored
 *   - Each user holds exactly one valid refresh token at a time (rotation on every refresh)
 *
 * Author: AmanVatsSharma
 * Last-updated: 2026-05-12
 */

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserService } from '@api/modules/user/services/user.service';
import { LoggerService } from '@api/shared/logger';

const REFRESH_TOKEN_BYTES = 48;

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Generate a new opaque refresh token for the given user.
   * Stores a SHA-256 hash of the token on the user record (DB-backed rotation).
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const hash = await bcrypt.hash(raw, 10);
    await this.userService.updateRefreshToken(userId, hash);
    this.logger.debug('refreshToken generated', { userId });
    return raw;
  }

  /**
   * Validate a raw refresh token against the stored hash for the given user.
   * Returns true if valid and not revoked (hash matches); false otherwise.
   */
  async validateRefreshToken(userId: string, rawToken: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) return false;
    const valid = await bcrypt.compare(rawToken, user.refreshToken);
    this.logger.debug('refreshToken validated', { userId, valid });
    return valid;
  }

  /**
   * Revoke the current refresh token for the given user by clearing the stored hash.
   */
  async revokeRefreshToken(userId: string): Promise<void> {
    await this.userService.updateRefreshToken(userId, null);
    this.logger.debug('refreshToken revoked', { userId });
  }
}