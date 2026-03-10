/**
 * @file api-client.ts
 * @module lib
 * @description Typed API fetcher with base URL from env and optional retry
 * @author BharatERP
 * @created 2025-03-10
 */

import { logger } from "./logger";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
};

export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  retries?: number;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Fetches from API with base URL, optional retry and correlation header.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  config: ApiClientConfig = {}
): Promise<T> {
  const baseUrl = config.baseUrl ?? getBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const requestId = generateRequestId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
    ...config.headers,
    ...(typeof options.headers === "object" && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };
  const init: RequestInit = { ...options, headers };
  let lastError: Error | null = null;
  const retries = config.retries ?? 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logger.debug("API_CALL", { url, requestId, attempt });
      const start = Date.now();
      const res = await fetch(url, init);
      const elapsed = Date.now() - start;

      if (!res.ok) {
        const text = await res.text();
        let body: unknown;
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
        logger.warn("API_ERROR", { status: res.status, url, requestId, elapsed, body });
        throw new ApiError(res.status, res.statusText, body);
      }

      const data = (await res.json().catch(() => ({}))) as T;
      logger.debug("API_CALL_OK", { url, requestId, elapsed });
      return data;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ApiError) throw e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    statusText: string,
    public body?: unknown
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

/** GET helper */
export function apiGet<T>(path: string, config?: ApiClientConfig): Promise<T> {
  return apiFetch<T>(path, { method: "GET" }, config);
}

/** POST helper */
export function apiPost<T>(path: string, body?: unknown, config?: ApiClientConfig): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }, config);
}
