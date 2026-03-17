# Module: auth

**Short:** Mobile number + OTP sign-in: send OTP, verify OTP, issue JWT for web and mobile clients.

**Purpose:** Provides unauthenticated GraphQL mutations to request and verify a one-time password by Indian mobile number, then issues a JWT and returns the user (get-or-create by phone). Clients use the token as `Authorization: Bearer <token>` on subsequent requests. Role assignment (admin/broker) is driven by env lists.

**Files:**

- `auth.module.ts` — Module definition; registers resolver and services, imports Logger and User modules.
- `index.ts` — Re-exports AuthModule and AuthService.
- `resolvers/auth.resolver.ts` — GraphQL resolver for sendOtp and verifyOtp mutations (both `@Public()`).
- `services/auth.service.ts` — Orchestrates send OTP, verify OTP, JWT issuance; get-or-create user by phone; sets admin/broker from ADMIN_PHONES/BROKER_PHONES.
- `services/otp.service.ts` — In-memory OTP storage with TTL; generates and validates 6-digit code; delegates sending to SmsService.
- `services/sms.service.ts` — Sends SMS via stub (log only), Twilio, or MSG91 based on SMS_PROVIDER and credentials.
- `services/sms-provider.interface.ts` — Interface for SMS sending (implementations: stub, Twilio, MSG91).
- `dtos/send-otp.dto.ts` — SendOtpInput (phone).
- `dtos/verify-otp.dto.ts` — VerifyOtpInput (phone, code).
- `dtos/send-otp-result.dto.ts` — SendOtpResult (success, message).
- `dtos/verify-otp-result.dto.ts` — VerifyOtpResult (token, user) and AuthUserResult (id, phone, displayName, role).
- `services/__tests__/auth.service.spec.ts` — Unit tests for AuthService.

**Dependencies:** LoggerModule (`@api/shared/logger`), UserModule (`@api/modules/user`). JwtService and ConfigService are used and assumed to be available (e.g. via global or app-level registration).

**APIs:** GraphQL mutations (both `@Public()`):

- **sendOtp(input: SendOtpInput!): SendOtpResult!** — Validates Indian mobile (10 digits, 6–9 start), generates 6-digit OTP, stores in memory with 5-min TTL, sends via SmsService. Returns `{ success, message }`.
- **verifyOtp(input: VerifyOtpInput!): VerifyOtpResult!** — Verifies code, get-or-creates User by phone (UserModule), optionally sets role from ADMIN_PHONES/BROKER_PHONES, issues JWT with `sub`, `phone`, `role`. Returns `{ token, user: { id, phone, displayName, role } }`.

**Env vars:**

- **JWT_SECRET** — Secret for signing JWTs (min 16 chars recommended).
- **JWT_EXPIRES_IN** — Token expiry (e.g. `7d`).
- **SMS_PROVIDER** — `stub` (default, log only), `twilio`, or `msg91`.
- **Twilio:** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (required when SMS_PROVIDER=twilio).
- **MSG91:** MSG91_AUTH_KEY; MSG91_SENDER (default `SMSIND`) (required when SMS_PROVIDER=msg91).
- **ADMIN_PHONES** — Comma-separated phone numbers to assign ADMIN role on verify.
- **BROKER_PHONES** — Comma-separated phone numbers to assign BROKER role on verify.

**MVP / Production checklist**

- **main.ts** enforces in production: `SMS_PROVIDER` must be `twilio` or `msg91` (startup throws if `stub` or empty).
- **SmsService** reads provider and credentials from config only; no hardcoded mock OTP. Stub path only logs; in production the app will not start with stub.
- For a deployable MVP with real OTP, set **SMS_PROVIDER** to `twilio` or `msg91` and the corresponding credentials:
  - **Twilio:** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM.
  - **MSG91:** MSG91_AUTH_KEY (optional: MSG91_SENDER, default `SMSIND`).
- When **SMS_PROVIDER** is unset or `stub`, OTP is only logged—no SMS is sent (local/dev only; production blocks stub).

**Flows**

1. **Send OTP:** Client calls `sendOtp(input: { phone })`. Backend validates Indian mobile, generates code, stores in memory with 5-min TTL, sends via SmsService (stub/twilio/msg91). In production set SMS_PROVIDER and provider credentials; when unset or stub, only logs (no mock in prod when configured).
2. **Verify OTP:** Client calls `verifyOtp(input: { phone, code })`. Backend verifies code, get-or-creates User by phone, applies admin/broker role from env if phone in list, issues JWT with `sub`, `phone`, `role`, returns token and user. Client stores token and sends it on API requests.

**Data**

- **OTP store:** In-memory `Map<phone, { code, expiresAt }>` (5-min TTL); no Redis required for minimal setup.
- **JWT:** Signed with **JWT_SECRET**, payload includes `sub` (user.id), `phone`, `role`; expiry from **JWT_EXPIRES_IN**.
- **User:** Created on first login by phone via UserModule; see User module.

**Change-log**

- 2026-03-17: MVP task 4 — SMS stub vs prod verified: main.ts enforces SMS_PROVIDER=twilio|msg91 in production; SmsService uses config only, no hardcoded mock OTP; env schema includes SMS_PROVIDER and Twilio/MSG91 vars.
- 2026-03-15: MVP readiness: added production checklist for SMS_PROVIDER (twilio/msg91 required for real OTP).
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: SmsService added; OTP sent via Twilio or MSG91 when SMS_PROVIDER and credentials set; stub when unset (no mock in prod when configured).
- 2025-03-12: verifyOtp get-or-creates User via UserService; JWT sub is user.id; VerifyOtpResult includes user { id, phone, displayName }; role in payload and result.
- 2025-03-12: Added auth module with sendOtp, verifyOtp, OtpService (in-memory), JWT issue.
