# Module: storage

**Short:** S3-backed image upload for property listings.

**Purpose:** Accept multipart image uploads via REST, validate type/size, upload to AWS S3, and return public URLs for use in Property `coverImageUrl` / `imageUrls`.

**Files:**
- storage.module.ts — Nest module
- storage.service.ts — S3 client, validation, upload
- controllers/upload.controller.ts — POST /api/v1/upload, POST /api/v1/upload-multiple
- MODULE_DOC.md — this file

**Dependencies:** @aws-sdk/client-s3, ConfigModule, LoggerModule.

**APIs (REST):**
- `POST /api/v1/upload` — single file, form field `file`. Returns `{ url: string }`.
- `POST /api/v1/upload-multiple` — multiple files, form field `files`. Returns `{ urls: string[] }`.

**Auth:** Upload routes are protected by the global AuthGuard when `JWT_SECRET` is set. Clients must send `Authorization: Bearer <token>`. The web post-property flow passes the auth token via `uploadImage(file, { token })` (see apps/web/src/lib/upload-api.ts).

**Validation:** Allowed types: image/jpeg, image/png, image/webp. Max size: 10 MB. Returns 400 when type/size invalid or S3 not configured.

**Env vars:** AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (optional if IAM role), S3_PUBLIC_BASE_URL (optional custom domain). All optional; app runs without S3 when unset (upload endpoints return 400).

**Change-log:**
- 2025-03-13: Implemented upload.controller.ts (was empty); POST /api/v1/upload and upload-multiple. Documented auth: protected by AuthGuard when JWT_SECRET set; web sends Bearer via upload-api.
- 2025-03-12: Initial: StorageService, UploadController, S3 upload, MODULE_DOC.
