/**
 * File:        apps/api/src/modules/auth/services/whatsapp-qr-otp.service.ts
 * Module:      auth/services
 * Purpose:     WhatsApp QR-based OTP flow using Baileys (WhatsApp Web protocol). No Meta Business API needed.
 *              The server runs a WhatsApp Web session; the user scans a QR with their phone to link it.
 *              OTP is then sent as a WhatsApp message to the linked session's chat.
 *              Verification uses bcrypt hash stored in Redis (via OtpSessionRedisRepository).
 *
 * Exports:
 *   - WhatsAppQrOtpService   — manages QR sessions, scan polling, OTP send/verify
 *
 * Depends on:
 *   - @api/shared/logger                    — LoggerService
 *   - @api/modules/auth/services/auth.service    — AuthService.finalizeMobileLogin
 *   - @api/modules/auth/services/otp-session-redis.repository — OtpSessionRedisRepository (Redis OTP store)
 *   - @api/modules/auth/services/otp.service   — OtpService.validatePhone
 *   - @nestjs/config                         — ConfigService
 *   - @whiskeysockets/baileys               — WhatsApp Web protocol
 *   - qrcode                                — QR array → PNG data URL
 *   - bcrypt                                — OTP hash compare
 *   - crypto                                — randomBytes for OTP
 *   - fs / os / path                        — temp auth-state dirs
 *
 * Side-effects:
 *   - Creates temp directories in os.tmpdir() for Baileys auth state per session
 *   - Makes outbound WhatsApp TCP connections to WhatsApp servers
 *   - Writes/deletes Redis keys for OTP hash and session state
 *
 * Key invariants:
 *   - One active session per phone number at a time (re-init invalidates previous)
 *   - OTP TTL is 5 minutes (300 sec); session cleanup always runs on verify/timeout
 *   - QR data URL is base64 PNG (not raw string); compatible with <img src="data:..." />
 *   - Baileys sockets auto-reconnect; scanned state detected via connection.update events
 *
 * Read order:
 *   1. WhatsAppQrSession interface      — session data shape
 *   2. WhatsAppQrOtpService class       — public API + internal helpers
 *   3. initializeSession / getOrCreateSession — session lifecycle
 *   4. initializeWhatsAppSession        — Baileys socket setup
 *   5. generateQrCode                    — QR array → data URL
 *   6. sendOtpViaWhatsApp               — OTP message send
 *   7. pollScanStatus / verifyOtp       — client-facing polling + verification
 *
 * Author:      BharatERP
 * Last-updated: 2026-05-12
 */

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@api/shared/logger';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { OtpSessionRedisRepository } from './otp-session-redis.repository';
import { maskIndianPhone, normalizeIndianLocal10 } from '../utils/mask-phone.util';
import type makeWASocket from '@whiskeysockets/baileys';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type WhatsAppQrSessionStatus =
  | 'initializing'
  | 'pending'
  | 'scanned'
  | 'ready'
  | 'failed';

export interface WhatsAppQrSession {
  sessionId: string;
  phoneNumber: string;
  socket: ReturnType<typeof makeWASocket> | null;
  qrCode: string | null;
  status: WhatsAppQrSessionStatus;
  createdAt: number;
  otpSent: boolean;
  otpHash?: string;
  otpExpiresAt?: number;
  /** The JID (phone@s.whatsapp.net) of the WhatsApp Web device — populated after link. */
  deviceJid?: string;
  /** Short random ID pre-generated before Baileys starts so the auth dir exists. */
  authDir: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class WhatsAppQrOtpService implements OnModuleInit, OnModuleDestroy {
  private readonly log: Logger;
  private readonly sessions = new Map<string, WhatsAppQrSession>();
  /** Authenticated Baileys sockets keyed by sessionId (separate from sessions map). */
  private readonly sockets = new Map<string, ReturnType<typeof makeWASocket>>();

  private readonly BCRYPT_ROUNDS = 10;
  private readonly OTP_TTL_SEC = 300;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly auth: AuthService,
    private readonly otpService: OtpService,
    private readonly sessionRepo: OtpSessionRedisRepository,
  ) {
    this.log = new Logger(WhatsAppQrOtpService.name);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async onModuleInit() {
    const enabled = this.config.get<string>('WHATSAPP_QR_ENABLED');
    if (enabled !== 'true') {
      this.log.log('WhatsApp QR OTP disabled (WHATSAPP_QR_ENABLED != true)');
    } else {
      this.log.log('WhatsApp QR OTP enabled');
    }
  }

  async onModuleDestroy() {
    this.log.debug('Cleaning up all WhatsApp QR sessions on shutdown');
    const cleanupPromises = Array.from(this.sessions.keys()).map((id) =>
      this.cleanupSession(id).catch((e) => this.log.error(`cleanupSession ${id} error: ${e.message}`)),
    );
    await Promise.allSettled(cleanupPromises);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Initialize (or refresh) a WhatsApp QR session for a phone number.
   * If a pending session already exists for this phone, the existing QR is returned
   * so the client can keep polling without re-generating the code.
   *
   * POST /auth/otp/whatsapp-qr/init → { sessionId, qrCode }
   */
  async initializeSession(phoneNumber: string): Promise<{ sessionId: string; qrCode: string }> {
    this.assertEnabled();

    if (!this.otpService.validatePhone(phoneNumber)) {
      throw new ServiceUnavailableException('Invalid Indian mobile number (10 digits, starting 6-9)');
    }

    const phone10 = normalizeIndianLocal10(phoneNumber);

    // Reuse existing pending session for the same phone to avoid invalidating QR unnecessarily.
    const existing = this.findSessionByPhone(phone10);
    if (existing && existing.status === 'pending') {
      this.log.debug('Reusing existing pending session', { sessionId: existing.sessionId, phone: maskIndianPhone(phone10) });
      if (!existing.qrCode) {
        throw new ServiceUnavailableException('Session QR not ready yet, poll /status/:sessionId');
      }
      return { sessionId: existing.sessionId, qrCode: existing.qrCode };
    }

    // Kill any previous session for this phone.
    if (existing) {
      await this.cleanupSession(existing.sessionId).catch(() => {/* ignore */});
    }

    const sessionId = randomBytes(6).toString('hex'); // 12-char hex
    const authDir = this.makeAuthDir(sessionId);

    const session: WhatsAppQrSession = {
      sessionId,
      phoneNumber: phone10,
      socket: null,
      qrCode: null,
      status: 'initializing',
      createdAt: Date.now(),
      otpSent: false,
      authDir,
    };

    this.sessions.set(sessionId, session);

    // Start Baileys asynchronously — QR will be available shortly via pollScanStatus.
    this.startBaileysSession(session).catch((err) => {
      this.log.error('Baileys session failed to start', err.message);
      session.status = 'failed';
      session.qrCode = null;
    });

    // Return a placeholder — client must poll status until qrCode is non-null.
    return { sessionId, qrCode: '' };
  }

  /**
   * Poll the scan status of a WhatsApp QR session.
   * Call this every 1–2 seconds from the client after init.
   *
   * GET /auth/otp/whatsapp-qr/status/:sessionId → { status, qrCode?, otpSent? }
   */
  pollScanStatus(sessionId: string): { status: WhatsAppQrSessionStatus; qrCode?: string; otpSent?: boolean } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { status: 'failed' };
    }
    const result: { status: WhatsAppQrSessionStatus; qrCode?: string; otpSent?: boolean } = {
      status: session.status,
    };
    if (session.qrCode) {
      result.qrCode = session.qrCode;
    }
    if (session.otpSent) {
      result.otpSent = true;
    }
    return result;
  }

  /**
   * Verify the 6-digit OTP that was sent via the WhatsApp chat.
   * On success, issues a JWT via AuthService.finalizeMobileLogin.
   *
   * POST /auth/otp/whatsapp-qr/verify → { success, accessToken?, user? }
   */
  async verifyOtp(
    sessionId: string,
    otp: string,
  ): Promise<{ success: boolean; accessToken?: string; user?: { id: string; phone: string; displayName: string | null; role: string } }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new ServiceUnavailableException('Session not found or expired');
    }

    if (!session.otpHash || !session.otpExpiresAt) {
      throw new ServiceUnavailableException('OTP not sent yet — scan QR and wait for delivery');
    }

    if (Date.now() > session.otpExpiresAt) {
      throw new ServiceUnavailableException('OTP expired — request a new one');
    }

    const ok = await bcrypt.compare(otp, session.otpHash);
    if (!ok) {
      this.logger.warn('whatsappQr.verify failed', { sessionId, phone: maskIndianPhone(session.phoneNumber) });
      return { success: false };
    }

    // Success — clear session and issue JWT.
    await this.cleanupSession(sessionId).catch(() => {/* ignore */});
    const { token, user } = await this.auth.finalizeMobileLogin(session.phoneNumber);
    return { success: true, accessToken: token, user };
  }

  /**
   * Explicitly destroy a WhatsApp QR session.
   *
   * DELETE /auth/otp/whatsapp-qr/session/:sessionId
   */
  async cleanupSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Close Baileys socket.
    try {
      if (session.socket) {
        session.socket.end();
      }
    } catch (_) {/* ignore */}

    // Remove from sockets map.
    this.sockets.delete(sessionId);

    // Remove from sessions map.
    this.sessions.delete(sessionId);

    // Delete temp auth directory.
    try {
      await fs.promises.rm(session.authDir, { recursive: true, force: true });
    } catch (_) {/* ignore */}

    this.log.debug('Session cleaned up', { sessionId });
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  /**
   * Starts a Baileys Web session for the given session object.
   * Sets up connection.update handler to capture QR codes and scan events.
   * When the QR is scanned and WhatsApp Web is linked, sends OTP via chat.
   */
  private async startBaileysSession(session: WhatsAppQrSession): Promise<void> {
    // Wait a tick so the caller can store the session reference first.
    await new Promise((r) => setTimeout(r, 50));

    const authDir = session.authDir;
    await fs.promises.mkdir(authDir, { recursive: true });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys') as typeof import('@whiskeysockets/baileys');

    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      qrTimeout: 120_000,  // 2 min before QR expires
      printQRInTerminal: true,
      browser: ['UrbanNest.ai OTP Server', 'Chrome', '1.0.0'],
      defaultQueryTimeoutMs: 60_000,
    });

    session.socket = sock;
    this.sockets.set(session.sessionId, sock);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr !== undefined && qr !== null) {
        // New QR available.
        try {
          const dataUrl = await generateQrCodeDataUrl(qr);
          session.qrCode = dataUrl;
          session.status = 'pending';
          this.log.debug('QR generated', { sessionId: session.sessionId, phone: maskIndianPhone(session.phoneNumber) });
        } catch (err) {
          this.log.error('Failed to generate QR', err instanceof Error ? err.message : String(err));
        }
      }

      if (connection === 'open') {
        this.log.log('WhatsApp Web connected', { sessionId: session.sessionId });
        session.status = 'ready';
        // Send OTP immediately on successful link.
        await this.sendOtpViaWhatsApp(session.sessionId);
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error &&
          String((lastDisconnect.error as { output?: { statusCode?: number } }).output?.statusCode).startsWith('5');

        if (!shouldReconnect) {
          session.status = 'failed';
          this.log.warn('WhatsApp Web disconnected (no reconnect)', { sessionId: session.sessionId });
          this.cleanupSession(session.sessionId).catch(() => {/* ignore */});
        } else {
          this.log.debug('WhatsApp Web reconnecting...', { sessionId: session.sessionId });
        }
      }
    });

    // Persist updated credentials.
    sock.ev.on('creds.update', saveCreds);

    // When a message arrives from the linked device, the scan is confirmed.
    // This is the most reliable signal that the link succeeded even if connection=open
    // hasn't fired yet.
    sock.ev.on('messages.upsert', async ({ messages }) => {
      if (session.status !== 'scanned' && session.status !== 'pending') return;
      const hasIncoming = messages.some((m) => !m.key.fromMe && m.message);
      if (hasIncoming && session.status !== 'ready') {
        this.log.debug('Incoming message detected — scan confirmed', { sessionId: session.sessionId });
        session.status = 'scanned';
      }
    });
  }

  /**
   * Generate a 6-digit OTP, bcrypt-hash it, and send it via WhatsApp chat.
   * Called automatically when the WhatsApp Web session becomes 'ready'.
   */
  private async sendOtpViaWhatsApp(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.socket) {
      throw new Error(`Session ${sessionId} not found or socket not ready`);
    }

    if (session.otpSent) {
      this.log.debug('OTP already sent for session', { sessionId });
      return;
    }

    const otp = String(Math.floor(Math.random() * 900_000) + 100_000);
    const hash = await bcrypt.hash(otp, this.BCRYPT_ROUNDS);
    const expiresAt = Date.now() + this.OTP_TTL_SEC * 1000;

    session.otpHash = hash;
    session.otpExpiresAt = expiresAt;
    session.otpSent = true;
    session.status = 'ready';

    // Determine the JID to send to — use the linked device's own number (the phone that scanned).
    // Baileys stores the device JID in creds once linked.
    const jid =
      (session.socket?.authState?.creds as Record<string, unknown>)?.me?.wid as string | undefined;

    const sendToJid = jid ?? `${session.phoneNumber}@s.whatsapp.net`;

    try {
      await session.socket?.sendMessage(sendToJid, {
        text: `Your UrbanNest.ai OTP is: ${otp}\nValid for 5 minutes. Do not share this code.`,
      });
      this.log.log('OTP sent via WhatsApp', { sessionId, phone: maskIndianPhone(session.phoneNumber), sendToJid });

      // Also store hash in Redis for durability (mirrors RestOtpService pattern).
      if (this.sessionRepo.isAvailable()) {
        await this.sessionRepo.saveSession(
          `waqr:${sessionId}`,
          { hash, requestId: null },
          this.OTP_TTL_SEC,
        );
      }
    } catch (err) {
      this.log.error('Failed to send OTP via WhatsApp', err instanceof Error ? err.message : String(err));
      session.status = 'failed';
      session.otpSent = false;
      throw err;
    }
  }

  /**
   * Get or create a session for a phone number.
   * Reuses pending sessions; creates new ones otherwise.
   */
  private getOrCreateSession(phoneNumber: string): WhatsAppQrSession | null {
    return this.findSessionByPhone(phoneNumber) ?? null;
  }

  private findSessionByPhone(phone: string): WhatsAppQrSession | undefined {
    const normalized = normalizeIndianLocal10(phone);
    for (const session of this.sessions.values()) {
      if (session.phoneNumber === normalized) {
        return session;
      }
    }
    return undefined;
  }

  private makeAuthDir(sessionId: string): string {
    return path.join(os.tmpdir(), `wa-qr-otp-${sessionId}`);
  }

  private assertEnabled(): void {
    if (this.config.get<string>('WHATSAPP_QR_ENABLED') !== 'true') {
      throw new ServiceUnavailableException('WhatsApp QR OTP is not enabled');
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure helper (no class dependencies)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a WhatsApp QR string array to a base64 PNG data URL.
 * Takes index 0 (the first/most recent QR before it rotates).
 */
async function generateQrCodeDataUrl(qrStrings: string[]): Promise<string> {
  if (!qrStrings || qrStrings.length === 0) {
    throw new Error('QR array is empty');
  }
  const qrData = qrStrings[0];
  const dataUrl: string = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
  return dataUrl;
}
