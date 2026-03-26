/**
 * @file route.ts
 * @module admin/api/auth/logout
 * @description POST /api/auth/logout — clears the admin httpOnly cookie.
 * @author BharatERP
 * @created 2026-03-26
 */

import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
