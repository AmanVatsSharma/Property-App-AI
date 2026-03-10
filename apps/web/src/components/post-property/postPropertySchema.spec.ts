/**
 * @file postPropertySchema.spec.ts
 * @module post-property
 * @description Unit tests for post-property form validation (Zod schema)
 * @author BharatERP
 * @created 2025-03-10
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

const postPropertySchema = z.object({
  listingFor: z.enum(["sell", "rent"], { required_error: "Select listing type" }),
  propertyType: z.enum(["apartment", "villa", "plot", "builder-floor", "office"], { required_error: "Select property type" }),
  address: z.string().min(5, "Address must be at least 5 characters").max(500, "Address too long"),
});

describe("postPropertySchema", () => {
  it("accepts valid payload", () => {
    const result = postPropertySchema.safeParse({
      listingFor: "sell",
      propertyType: "apartment",
      address: "Sector 108, Gurgaon",
    });
    expect(result.success).toBe(true);
  });

  it("rejects address shorter than 5 characters", () => {
    const result = postPropertySchema.safeParse({
      listingFor: "sell",
      propertyType: "apartment",
      address: "ab",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 5/);
    }
  });

  it("rejects invalid listingFor", () => {
    const result = postPropertySchema.safeParse({
      listingFor: "invalid",
      propertyType: "apartment",
      address: "Valid address here",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty address", () => {
    const result = postPropertySchema.safeParse({
      listingFor: "rent",
      propertyType: "villa",
      address: "",
    });
    expect(result.success).toBe(false);
  });
});
