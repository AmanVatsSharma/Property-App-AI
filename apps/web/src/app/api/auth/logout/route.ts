/**
 * @file route.ts
 * @module api/auth/logout
 * @description POST /api/auth/logout — clears the auth httpOnly cookie.
 * @author BharatERP
 * @created 2026-03-26
 */

import { NextResponse } from "next/server";

const COOKIE_NAME = "konkreet_token";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
