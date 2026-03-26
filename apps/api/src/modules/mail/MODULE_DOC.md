# Module: mail

**Short:** Email delivery via Nodemailer (SMTP). No-op stub when SMTP not configured.

**Purpose:** Send transactional emails (e.g. saved-search alerts) through configurable SMTP. When `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set, MailService creates a Nodemailer transporter and sends mail; otherwise it logs a debug message and returns without sending.

**Files:**
- `mail.module.ts` — Global module; imports LoggerModule; providers/exports MailService.
- `mail.service.ts` — MailService: constructor builds transporter from env (or null); send(payload) no-ops when transporter is null, else sendMail with try/catch and warn on failure.
- `templates/saved-search-alert.template.ts` — savedSearchAlertHtml(opts), savedSearchAlertText(opts) for dark-themed saved-search alert emails.

**Env:**
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — required for real sending; all optional/empty in schema (stub mode).
- `SMTP_PORT` (default 587), `SMTP_SECURE` (default false), `SMTP_FROM` (default "KonKreet <noreply@urbannest.ai>").

**Integration:** SavedSearchService.runAlerts() calls MailService.send() with saved-search alert payload (fire-and-forget). Recipient is placeholder until User entity has email.

**Change-log:**
- 2026-03-19: Phase 3 — Mail module (MailService, Nodemailer, stub when unconfigured); saved-search-alert template; MailModule registered in AppModule.
