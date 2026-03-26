/**
 * @file route.ts
 * @module api/auth/me
 * @description GET /api/auth/me — reads httpOnly cookie, returns token for client-side use.
 *   Returns { token } when authenticated, { token: null } otherwise.
 *   The token is relayed to client state so GraphQL calls can attach the Bearer header.
 * @author BharatERP
 * @created 2026-03-26
 */

import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "konkreet_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ token });
}
