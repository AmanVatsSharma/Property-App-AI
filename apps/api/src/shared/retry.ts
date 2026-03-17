/**
 * @file retry.ts
 * @module shared
 * @description Retry with exponential backoff for idempotent/safe external calls (5xx or network errors only).
 * @author BharatERP
 * @created 2026-03-17
 */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_MS = 500;

function isRetryable(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const code = (err as { code?: string }).code;
    const status = (err as { response?: { status?: number } }).response?.status;
    if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || code === 'ECONNREFUSED') return true;
    if (typeof status === 'number' && status >= 500) return true;
  }
  return false;
}

/**
 * Executes fn; on retryable failure retries up to maxRetries with exponential backoff.
 * Only retries on 5xx or network errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; initialMs?: number } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialMs = options.initialMs ?? DEFAULT_INITIAL_MS;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries || !isRetryable(err)) throw err;
      const delay = initialMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
