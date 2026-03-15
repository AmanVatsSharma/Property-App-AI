# Module: storage

**Short:** S3-backed image upload for property listings.

**Purpose:** Accept multipart image uploads via REST, validate type/size, upload to AWS S3, and return public URLs for use in Property `coverImageUrl` / `imageUrls`.

**Files:**
- `storage.module.ts` — Nest module; registers StorageService and UploadController.
- `storage.service.ts` — S3 client, validation (MIME/size), upload and public URL building.
- `controllers/upload.controller.ts` — REST endpoints: POST `/api/v1/upload`, POST `/api/v1/upload-multiple`.
- `MODULE_DOC.md` — this file.

**Dependencies:** `@aws-sdk/client-s3`, ConfigModule, LoggerModule.

**APIs (REST):**
- `POST /api/v1/upload` — single file, form field `file`. Returns `{ url: string }`.
- `POST /api/v1/upload-multiple` — multiple files, form field `files` (max 10). Returns `{ urls: string[] }`.

**Env vars:** `AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (optional if IAM role), `S3_PUBLIC_BASE_URL` (optional custom domain). All optional; app runs without S3 when unset (upload endpoints return 400).

**Auth:** Upload routes are protected by the global AuthGuard when `JWT_SECRET` is set. No per-controller guard; clients must send `Authorization: Bearer <token>`. The web post-property flow passes the token via `uploadImage(file, { token })` (see `apps/web/src/lib/upload-api.ts`).

**Validation:** Allowed types: `image/jpeg`, `image/png`, `image/webp`. Max size: 10 MB. Returns 400 when type/size invalid or S3 not configured.

**Change-log:**
- 2026-03-15: MVP readiness: no mock data; deploy and env checklist in docs/DEPLOYMENT.md.
- 2026-03-14: Documentation consistency pass (canonical template and code alignment).
- 2025-03-13: Implemented upload.controller.ts (was empty); POST /api/v1/upload and upload-multiple. Documented auth: protected by AuthGuard when JWT_SECRET set; web sends Bearer via upload-api.
- 2025-03-12: Initial: StorageService, UploadController, S3 upload, MODULE_DOC.
