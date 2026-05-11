# Module: auth

**Short:** Mobile number + OTP sign-in: send OTP, verify OTP, issue JWT for web and mobile clients.

**Purpose:** Unauthenticated OTP sign-in for Indian mobiles: **GraphQL** (`sendOtp` / `verifyOtp`) via configurable SMS providers, and **REST** (`POST /auth/otp/*`) via **MSG91 Control API v5** with **bcrypt-hashed** OTP in **Redis** (required for REST). Clients use `Authorization: Bearer <token>` after verify. Role assignment (admin/broker) is driven by env lists.

**Files:**

- `auth.module.ts` — Module definition; registers resolver, REST controller, services, imports Logger and User modules.
- `controllers/auth-otp.controller.ts` — REST `POST /auth/otp/send|verify|resend` (`VERSION_NEUTRAL`, `@Public()`).
- `index.ts` — Re-exports AuthModule and AuthService.
- `resolvers/auth.resolver.ts` — GraphQL resolver for sendOtp and verifyOtp mutations (both `@Public()`).
- `services/auth.service.ts` — GraphQL send/verify OTP, `finalizeMobileLogin` for JWT after any validated OTP path.
- `services/otp.service.ts` — OTP generation and validation; delegates storage to OtpStoreService; delegates sending to SmsService.
- `services/otp-store.service.ts` — OTP storage: Redis-backed when REDIS_URL set (same Redis as throttler), in-memory fallback otherwise; 5-min TTL.
- `services/sms.service.ts` — Sends SMS via stub (log only), Twilio, MSG91, or Zavu (`@zavudev/sdk`) based on SMS_PROVIDER and credentials.
- `services/sms-provider.interface.ts` — Interface for SMS sending (legacy reference; concrete providers live in SmsService).
- `dtos/send-otp.dto.ts` — SendOtpInput (phone).
- `dtos/verify-otp.dto.ts` — VerifyOtpInput (phone, code).
- `dtos/send-otp-result.dto.ts` — SendOtpResult (success, message).
- `dtos/verify-otp-result.dto.ts` — VerifyOtpResult (token, user) and AuthUserResult (id, phone, displayName, role).
- `services/__tests__/auth.service.spec.ts` — Unit tests for AuthService.
- `services/__tests__/sms.service.spec.ts` — Unit tests for SmsService (Zavu, MSG91 `sendotp.php` via mocked `fetch`, stub fallback).
- `services/rest-otp.service.ts` — REST OTP orchestration (rate limits, resend cooldown, bcrypt verify, max attempts).
- `services/otp-session-redis.repository.ts` — Redis keys for REST session hash, verify failures, send rate limit, resend cooldown.
- `integrations/msg91-otp-v5.service.ts` — Axios client to MSG91 `POST {base}/otp` with retries, timeout, `Authkey` header.
- `utils/mask-phone.util.ts` — Mask phones in logs/responses.
- `dto/send-otp-rest.dto.ts` / `verify-otp-rest.dto.ts` — REST bodies (`phoneNumber`, `otp`).
- `services/__tests__/rest-otp.service.spec.ts` — Verify path unit tests.

**Dependencies:** LoggerModule (`@api/shared/logger`), UserModule (`@api/modules/user`). JwtService and ConfigService are used and assumed to be available (e.g. via global or app-level registration).

**APIs — GraphQL** (both `@Public()`):

- **sendOtp(input: SendOtpInput!): SendOtpResult!** — Validates Indian mobile (10 digits, 6–9 start), generates 6-digit OTP, stores in OtpStoreService with 5-min TTL, sends via SmsService. Returns `{ success, message }`.
- **verifyOtp(input: VerifyOtpInput!): VerifyOtpResult!** — Verifies code against OtpStoreService, then `finalizeMobileLogin`. Returns `{ token, user }`.

**APIs — REST** (`AuthOtpController`, `@Public()`, version-neutral — **no** `X-API-Version` header required):

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/otp/send` | `{ "phoneNumber": "9876543210" }` | `{ "requestId": string \| null, "maskedPhone": "+91 ******3210" }` |
| POST | `/auth/otp/verify` | `{ "phoneNumber": "...", "otp": "123456" }` | `{ "accessToken": "jwt...", "user": { "id","phone","displayName","role" } }` |
| POST | `/auth/otp/resend` | `{ "phoneNumber": "..." }` | Same as send (requires active session; respects resend cooldown) |

REST requirements: **REDIS_URL**, **MSG91_AUTH_KEY**, **MSG91_TEMPLATE_ID** (template with `##OTP##`), **REST_OTP_MSG91_ENABLED** not `false`. OTP is **bcrypt**-hashed at rest; plaintext never stored. Per-phone **send** rate limit (default 5 / 10 min), **verify** max attempts (default 3), **resend cooldown** (default 60s). Logs use masked phone only.

**curl examples**

```bash
API=http://localhost:3333
curl -sS -X POST "$API/auth/otp/send" -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"9876543210"}'

curl -sS -X POST "$API/auth/otp/verify" -H 'Content-Type: application/json' \
  -d '{"phoneNumber":"9876543210","otp":"123456"}'
```

**MSG91 — which integration am I using?**

Confirm the **client entrypoint** and configure the matching env vars. Both paths read `MSG91_AUTH_KEY`, but they call **different MSG91 APIs**; fixing sender/template/DLT for one does not fix the other.

| You call… | MSG91 API (server) | Required env (MSG91-related) |
|-----------|-------------------|------------------------------|
| GraphQL `sendOtp` / `verifyOtp` | Legacy GET `https://api.msg91.com/api/sendotp.php` | `SMS_PROVIDER=msg91`, `MSG91_AUTH_KEY`, `MSG91_SENDER` (approved sender for your account) |
| REST `POST /auth/otp/send` (and verify/resend) | Control API v5 POST `https://control.msg91.com/api/v5/otp` (`Authkey` header) | `MSG91_AUTH_KEY`, **`MSG91_TEMPLATE_ID`** (dashboard template with `##OTP##`), `REDIS_URL`, `REST_OTP_MSG91_ENABLED` not `false` |

REST send response includes **`requestId`** (MSG91 `request_id` when present). Mobile passed to v5 is `91` + 10 digits (e.g. `919876543210`), consistent with MSG91 international format without a leading `+`.

**MSG91 credentials — API Auth Key vs OTP Widget token**

Use the **API Auth Key** from the MSG91 control panel (account API / server-side integration). The **OTP Login Widget** docs refer to a **separate widget token** for embedding the widget in a browser; that token is **not** what `Msg91OtpV5Service` or `sendotp.php` integration expects. If the wrong credential type is used, the API typically errors; if unsure, re-copy the Auth Key from the control panel’s API section.

**Troubleshooting: our API returns HTTP 200 but the handset gets no SMS**

A **200** from this app means the upstream call **succeeded** (for REST: MSG91 returned HTTP 2xx and JSON `type: success`). That is **acceptance**, not guaranteed **delivery** to the SIM. Check the following:

1. **MSG91 console — logs / delivery reports** — Find the message by time or by **`requestId`** returned from `POST /auth/otp/send`. Read the carrier / DLT / failure reason there; that is the source of truth for “why no SMS.”
2. **India DLT** — Principal entity, sender, template, and variables must be registered and approved; misalignment often shows as accepted API + failed or delayed delivery.
3. **REST template** — `MSG91_TEMPLATE_ID` must match an approved OTP template that includes **`##OTP##`**.
4. **GraphQL path** — `MSG91_SENDER` must be your **approved** sender ID (the default `SMSIND` may not be valid for your account).
5. **Account** — Sufficient balance; transactional vs promotional route; try another number or operator to rule out DND/filter issues.

For GraphQL-only diagnosis, you can run `npm run test:msg91-sms` ([`scripts/test-msg91-otp.cjs`](../../../../../scripts/test-msg91-otp.cjs)) with the same `MSG91_AUTH_KEY` and compare MSG91 reports.

**Key decisions:** MSG91 **v5 send** delivers a **server-generated** 6-digit OTP; verification is **local** (`bcrypt.compare`) so we do not depend on MSG91’s server-side verify API (which applies when MSG91 generates the OTP internally). GraphQL and REST use **different Redis key namespaces**; avoid mixing flows for the same login step on one device. WhatsApp fallback can be added when MSG91 documents a stable `otp_channel` for your template.

**Env vars:**

- **JWT_SECRET** — Secret for signing JWTs (min 16 chars recommended).
- **JWT_EXPIRES_IN** — Token expiry (e.g. `7d`).
- **SMS_PROVIDER** — `stub` (default, log only), `twilio`, `msg91`, or `zavu`.
- **Twilio:** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (required when SMS_PROVIDER=twilio).
- **MSG91:** MSG91_AUTH_KEY; MSG91_SENDER (default `SMSIND`) (required when SMS_PROVIDER=msg91). Integration uses legacy **sendotp.php** (GET): `mobile=91xxxxxxxxxx`, full text `message`, and `otp` from `OtpService` (6 digits). In the MSG91 dashboard: register sender ID, create/approve an OTP-capable template if required by your account. If MSG91 deprecates this endpoint for your account, migrate to **Send OTP 2.0** (separate implementation; see [MSG91 OTP docs](https://docs.msg91.com/reference/sendotp)).
- **Zavu:** ZAVUDEV_API_KEY (`zv_live_*` / `zv_test_*`) when SMS_PROVIDER=zavu. Optional **ZAVUDEV_SENDER** — sender profile id (maps to `Zavu-Sender` on send). OTP is sent as SMS (`channel: sms`) to E.164 `+91` + 10-digit local number.
- **ADMIN_PHONES** — Comma-separated phone numbers to assign ADMIN role on verify.
- **BROKER_PHONES** — Comma-separated phone numbers to assign BROKER role on verify.
- **REST / MSG91 v5:** `MSG91_TEMPLATE_ID`, `MSG91_OTP_BASE_URL` (optional), `MSG91_OTP_HTTP_TIMEOUT_MS`, `MSG91_OTP_HTTP_RETRIES`, `REST_OTP_MSG91_ENABLED`, `OTP_BCRYPT_ROUNDS`, `OTP_REST_TTL_SEC`, `OTP_REST_SEND_RATE_LIMIT`, `OTP_REST_SEND_RATE_WINDOW_SEC`, `OTP_REST_MAX_VERIFY_ATTEMPTS`, `OTP_REST_RESEND_COOLDOWN_SEC` — see `.env.example`.

**MVP / Production checklist**

- **main.ts** enforces in production: `SMS_PROVIDER` must be `twilio`, `msg91`, or `zavu` (startup throws if `stub` or empty). Required credentials: **zavu** → `ZAVUDEV_API_KEY`; **msg91** → `MSG91_AUTH_KEY`; **twilio** → full Twilio trio. REST OTP additionally needs **REDIS_URL** and **MSG91_TEMPLATE_ID** at runtime (else endpoints return 503).
- **SmsService** reads provider and credentials from config only; no hardcoded mock OTP. Stub path only logs; in production the app will not start with stub.
- For a deployable MVP with real OTP, set **SMS_PROVIDER** to `twilio`, `msg91`, or `zavu` and the corresponding credentials:
  - **Twilio:** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM.
  - **MSG91:** MSG91_AUTH_KEY (optional: MSG91_SENDER, default `SMSIND`).
  - **Zavu:** ZAVUDEV_API_KEY; optional ZAVUDEV_SENDER.
- When **SMS_PROVIDER** is unset or `stub`, OTP is only logged—no SMS is sent (local/dev only; production blocks stub).

**Flows**

1. **Send OTP:** Client calls `sendOtp(input: { phone })`. Backend validates Indian mobile, generates code, stores in memory with 5-min TTL, sends via SmsService (stub/twilio/msg91/zavu). In production set SMS_PROVIDER and provider credentials; when unset or stub, only logs (no mock in prod when configured).
2. **Verify OTP:** Client calls `verifyOtp(input: { phone, code })`. Backend verifies code, get-or-creates User by phone, applies admin/broker role from env if phone in list, issues JWT with `sub`, `phone`, `role`, returns token and user. Client stores token and sends it on API requests.

**Data**

- **OTP store:** OtpStoreService uses Redis (when REDIS_URL set, via REDIS_THROTTLE_TOKEN) or in-memory Map (5-min TTL); survives restarts and works across instances when Redis is configured.
- **JWT:** Signed with **JWT_SECRET**, payload includes `sub` (user.id), `phone`, `role`; expiry from **JWT_EXPIRES_IN**.
- **User:** Created on first login by phone via UserModule; see User module.

**Change-log**

- 2026-03-28: **MSG91 operator guide:** MODULE_DOC sections — which flow (GraphQL vs REST), Auth Key vs widget token, dual-API table, troubleshooting HTTP 200 without SMS and using `requestId` in MSG91 logs; `.env.example` comments for MSG91_AUTH_KEY and template.
- 2026-03-28: **REST OTP + MSG91 v5:** `AuthOtpController` (`/auth/otp/send|verify|resend`), `RestOtpService`, `OtpSessionRedisRepository`, `Msg91OtpV5Service` (axios, retries); bcrypt hashes in Redis; rate limit / verify attempts / resend cooldown; `AuthService.finalizeMobileLogin` shared with GraphQL; env schema + `.env.example`; `rest-otp.service.spec.ts`.
- 2026-03-28: **MSG91 reliability:** Production `main.ts` requires `MSG91_AUTH_KEY` when `SMS_PROVIDER=msg91` and full Twilio env when `SMS_PROVIDER=twilio`; Jest tests for `sendotp.php` (success / JSON error / HTTP error); root script `scripts/test-msg91-otp.cjs` and `npm run test:msg91-sms` / `test:msg91-otp-api`; MODULE_DOC MSG91 operations note (legacy API vs 2.0).
- 2026-03-28: **Zavu SMS provider:** SMS_PROVIDER=zavu; ZAVUDEV_API_KEY and optional ZAVUDEV_SENDER; SmsService uses `@zavudev/sdk` (SMS to +91 E.164); `SmsService.send(phone, message, otpCode?)` passes OTP from OtpService so Zavu idempotency is `otp-{phone}-{code}` and MSG91’s `otp` query param is not skewed by digits in “5 minutes”; production main.ts allows zavu with API key check; env schema and `.env.example` updated; `sms.service.spec.ts` added.
- 2026-03-18: **Redis-backed OTP store:** OtpStoreService added; Redis when REDIS_URL set (REDIS_THROTTLE_TOKEN), in-memory fallback; OtpService.set/verify/get now async; AuthService awaits OTP storage calls.
- 2026-03-17: MVP task 4 — SMS stub vs prod verified: main.ts enforces SMS_PROVIDER=twilio|msg91 in production; SmsService uses config only, no hardcoded mock OTP; env schema includes SMS_PROVIDER and Twilio/MSG91 vars.
- 2026-03-15: MVP readiness: added production checklist for SMS_PROVIDER (twilio/msg91 required for real OTP).
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: SmsService added; OTP sent via Twilio or MSG91 when SMS_PROVIDER and credentials set; stub when unset (no mock in prod when configured).
- 2025-03-12: verifyOtp get-or-creates User via UserService; JWT sub is user.id; VerifyOtpResult includes user { id, phone, displayName }; role in payload and result.
- 2025-03-12: Added auth module with sendOtp, verifyOtp, OtpService (in-memory), JWT issue.
