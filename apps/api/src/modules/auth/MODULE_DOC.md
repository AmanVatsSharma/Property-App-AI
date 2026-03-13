# Auth Module

## Purpose

Provides mobile number + OTP sign-in: send OTP, verify OTP, issue JWT. Used by web and mobile clients for login; tokens are sent as `Authorization: Bearer <token>` on subsequent requests.

## Flows

1. **Send OTP**: Client calls GraphQL `sendOtp(input: { phone })`. Backend validates Indian mobile (10 digits, 6–9 start), generates 6-digit code, stores in memory with 5-min TTL, and sends via SmsService. In production set `SMS_PROVIDER=twilio` or `SMS_PROVIDER=msg91` with credentials; when unset, stub logs only (dev).
2. **Verify OTP**: Client calls `verifyOtp(input: { phone, code })`. Backend verifies code, get-or-creates User by phone (UserModule), issues JWT with `sub: user.id` and `phone`, returns `{ token, user: { id, phone, displayName } }`. Client stores token and sends it on API requests.

## Data

- OTP store: in-memory `Map<phone, { code, expiresAt }>` (no Redis required for minimal setup).
- JWT: signed with app `JWT_SECRET`, payload `{ sub: user.id, phone }`, expiry from `JWT_EXPIRES_IN`.
- User: created on first login by phone; see User module.

## Public API

- `sendOtp(input: SendOtpInput!): SendOtpResult!`
- `verifyOtp(input: VerifyOtpInput!): VerifyOtpResult!`

Both mutations are `@Public()` so unauthenticated users can call them.

## Changelog

- 2025-03-12: Added auth module with sendOtp, verifyOtp, OtpService (in-memory), JWT issue.
- 2025-03-12: verifyOtp get-or-creates User via UserService; JWT sub is user.id; VerifyOtpResult includes user { id, phone, displayName }.
- 2025-03-13: SmsService added; OTP sent via Twilio or MSG91 when SMS_PROVIDER and credentials set; stub when unset (no mock in prod when configured).
