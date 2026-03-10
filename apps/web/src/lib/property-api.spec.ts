/**
 * @file property-api.spec.ts
 * @module lib
 * @description Unit tests for getPropertyById (mock resolution)
 * @author BharatERP
 * @created 2025-03-10
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getPropertyById } from "./property-api";

describe("getPropertyById", () => {
  const origEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = origEnv;
  });

  it("returns mock property for sobha-city-vista when no API URL", async () => {
    const result = await getPropertyById("sobha-city-vista");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("sobha-city-vista");
    expect(result?.title).toContain("Sobha City Vista");
    expect(result?.price).toBe("₹2.85 Cr");
  });

  it("returns mock property for detail slug (alias)", async () => {
    const result = await getPropertyById("detail");
    expect(result).not.toBeNull();
    expect(result?.title).toContain("Sobha City Vista");
  });

  it("returns mock property for dlf-mypad", async () => {
    const result = await getPropertyById("dlf-mypad");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("dlf-mypad");
    expect(result?.title).toContain("DLF MyPad");
  });

  it("returns null for unknown id when no API", async () => {
    const result = await getPropertyById("unknown-slug-xyz");
    expect(result).toBeNull();
  });
});
