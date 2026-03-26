/**
 * @file route.ts
 * @module admin/api/auth/me
 * @description GET /api/auth/me — reads the admin httpOnly cookie and returns the token
 *   so the client can hydrate auth state without reading localStorage.
 * @author BharatERP
 * @created 2026-03-26
 */

import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ token });
}
