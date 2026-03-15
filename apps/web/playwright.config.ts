/**
 * @file playwright.config.ts
 * @module web
 * @description Playwright e2e config; run after starting dev server
 * @author BharatERP
 * @created 2025-03-10
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // E2E assumes real API: set NEXT_PUBLIC_GRAPHQL_HTTP or E2E_GRAPHQL_URL so the app can reach the API (no mock listing data).
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        env: {
          ...process.env,
          NEXT_PUBLIC_GRAPHQL_HTTP:
            process.env.NEXT_PUBLIC_GRAPHQL_HTTP ?? process.env.E2E_GRAPHQL_URL ?? "http://localhost:3333/graphql",
        },
      }
    : undefined,
});
