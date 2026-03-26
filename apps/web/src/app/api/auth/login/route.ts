/**
 * @file route.ts
 * @module api/auth/login
 * @description POST /api/auth/login — exchanges OTP verify result for an httpOnly cookie.
 *   Called by LoginModal instead of storing JWT in localStorage.
 * @author BharatERP
 * @created 2026-03-26
 */

import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "konkreet_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
