/**
 * @file graphql-client.spec.ts
 * @module admin/lib
 * @description Smoke tests for admin GraphQL client helpers.
 * @author BharatERP
 * @created 2026-03-26
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared runGraphQL so we don't hit the network in tests
vi.mock("@property-app-ai/shared", () => ({
  runGraphQL: vi.fn(),
}));

import { runGraphQL } from "@property-app-ai/shared";

describe("getGraphQLUrl (via gqlMe)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    delete process.env.NEXT_PUBLIC_GRAPHQL_HTTP;
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("throws when no URL is configured", async () => {
    const { gqlMe } = await import("./graphql-client");
    await expect(gqlMe(null)).rejects.toThrow("GraphQL URL not configured");
  });

  it("uses NEXT_PUBLIC_GRAPHQL_HTTP when set", async () => {
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP = "http://test-api/graphql";
    vi.mocked(runGraphQL).mockResolvedValueOnce({ me: null });

    const { gqlMe } = await import("./graphql-client");
    const result = await gqlMe(null);
    expect(result).toBeNull();
    expect(runGraphQL).toHaveBeenCalledWith(
      "http://test-api/graphql",
      expect.any(Object)
    );
  });

  it("builds URL from NEXT_PUBLIC_API_URL without producing 'undefined/graphql'", async () => {
    delete process.env.NEXT_PUBLIC_GRAPHQL_HTTP;
    process.env.NEXT_PUBLIC_API_URL = "http://my-api:3333";
    vi.mocked(runGraphQL).mockResolvedValueOnce({ me: null });

    const { gqlMe } = await import("./graphql-client");
    await gqlMe(null);
    const [calledUrl] = vi.mocked(runGraphQL).mock.calls[0];
    expect(calledUrl).toBe("http://my-api:3333/graphql");
    expect(calledUrl).not.toContain("undefined");
  });

  it("does NOT produce 'undefined/graphql' when NEXT_PUBLIC_API_URL is unset", async () => {
    delete process.env.NEXT_PUBLIC_GRAPHQL_HTTP;
    delete process.env.NEXT_PUBLIC_API_URL;

    const { gqlMe } = await import("./graphql-client");
    await expect(gqlMe(null)).rejects.toThrow("GraphQL URL not configured");
    expect(runGraphQL).not.toHaveBeenCalledWith(
      "undefined/graphql",
      expect.any(Object)
    );
  });
});

describe("gqlVerifyOtp", () => {
  it("returns token and user on success", async () => {
    process.env.NEXT_PUBLIC_GRAPHQL_HTTP = "http://test/graphql";
    vi.mocked(runGraphQL).mockResolvedValueOnce({
      verifyOtp: {
        token: "jwt-abc",
        user: { id: "u1", phone: "+911234567890", displayName: null, role: "user" },
      },
    });

    const { gqlVerifyOtp } = await import("./graphql-client");
    const result = await gqlVerifyOtp("+911234567890", "123456");
    expect(result.token).toBe("jwt-abc");
    expect(result.user.role).toBe("user");
  });
});
