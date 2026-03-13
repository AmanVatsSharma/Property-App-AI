/**
 * @file property-api.spec.ts
 * @module lib
 * @description Unit tests for getPropertyById (no mock; returns null when API not configured or not found).
 * @author BharatERP
 * @created 2025-03-10
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getPropertyById } from "./property-api";

describe("getPropertyById", () => {
  const origGraphql = process.env.NEXT_PUBLIC_GRAPHQL_HTTP;
  const origApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_GRAPHQL_HTTP;
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP = origGraphql;
    process.env.NEXT_PUBLIC_API_URL = origApiUrl;
  });

  it("returns null when no API URL configured", async () => {
    const result = await getPropertyById("sobha-city-vista");
    expect(result).toBeNull();
  });

  it("returns null for any id when no API URL", async () => {
    const result = await getPropertyById("unknown-slug-xyz");
    expect(result).toBeNull();
  });
});
