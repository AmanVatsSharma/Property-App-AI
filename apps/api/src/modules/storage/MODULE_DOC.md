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

**Validation:** Allowed types: image/jpeg, image/png, image/webp. Max size: 10 MB. Returns 400 when type/size invalid or S3 not configured.

**Env vars:** AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (optional if IAM role), S3_PUBLIC_BASE_URL (optional custom domain). All optional; app runs without S3 when unset (upload endpoints return 400).

**Change-log:**
- 2025-03-12: Initial: StorageService, UploadController, S3 upload, MODULE_DOC.
