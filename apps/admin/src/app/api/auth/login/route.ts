/**
 * @file route.ts
 * @module admin/api/auth/login
 * @description POST /api/auth/login — stores admin JWT in an httpOnly cookie.
 *   Replaces the previous localStorage-based token storage for XSS hardening.
 * @author BharatERP
 * @created 2026-03-26
 */

import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours for admin sessions

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token: string | undefined = body?.token;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
