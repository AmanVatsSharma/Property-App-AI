/**
 * @file upload-api.ts
 * @module lib
 * @description Upload image to backend; returns S3 URL for use in property create/update.
 * @author BharatERP
 * @created 2025-03-12
 */

import { ApiError } from "./api-client";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
}

export interface UploadImageResult {
  url: string;
}

/**
 * Upload a single image file to the backend; backend stores in S3 and returns public URL.
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/upload`;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      "X-Request-Id": `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    throw new ApiError(res.status, res.statusText, body);
  }

  const data = (await res.json()) as UploadImageResult;
  if (!data?.url) {
    throw new Error("Upload response missing url");
  }
  return data;
}
