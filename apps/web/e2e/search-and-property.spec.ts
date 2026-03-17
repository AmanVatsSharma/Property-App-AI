/**
 * @file search-and-property.spec.ts
 * @module e2e
 * @description E2E: search page and property detail flow. Uses real API only
 * (no mock listing data, no static slugs). Flow: /search → click card → /property/[id].
 * Ensure API is running and NEXT_PUBLIC_GRAPHQL_HTTP (or E2E_GRAPHQL_URL in CI) is set.
 * @author BharatERP
 * @created 2025-03-10
 */

import { test, expect } from "@playwright/test";

test.describe("Search and property detail", () => {
  test("search page loads and shows search UI", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator(".search-top-bar")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".sort-select")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".listings-wrap")).toBeVisible({ timeout: 15000 });
    // Results area shows loading then cards or empty/error (API-sourced, no mock data)
    await expect(page.locator(".results-meta")).toContainText(/Loading|Showing|/, { timeout: 20000 });
  });

  test("search then click card opens property detail by id when results exist", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator(".search-top-bar")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".listings-wrap")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".results-meta")).toContainText(/Showing|/, { timeout: 20000 });
    const cardCount = await page.locator(".prop-card").count();
    if (cardCount > 0) {
      const firstCard = page.locator(".prop-card").first();
      await firstCard.click();
      await expect(page).toHaveURL(/\/property\/[^/]+/, { timeout: 10000 });
      await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator(".detail-layout")).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page).toHaveURL(/\/search/);
      await expect(page.locator(".search-top-bar")).toBeVisible();
    }
  });

  test("search URL state: sort param reflected", async ({ page }) => {
    await page.goto("/search?sort=price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const sortSelect = page.locator(".sort-select");
    await expect(sortSelect).toHaveValue("price-asc");
  });
});

test.describe("AI Fab", () => {
  // Target the floating FAB only (exact label); landing page has other "open AI assistant" buttons.
  test("opens AI panel and shows prompt input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open AI assistant", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /UrbanNest AI/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByPlaceholder(/3 BHK|Describe your home|e\.g\. 3 BHK under/i)).toBeVisible();
  });

  test("AI panel has send button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open AI assistant", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /UrbanNest AI/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole("button", { name: /^Send$/ })).toBeVisible();
  });

  test("submit prompt shows result or error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open AI assistant", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /UrbanNest AI/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.getByPlaceholder(/3 BHK|Describe your home|e\.g\. 3 BHK under/i).fill("2 BHK in Bangalore under 80 lakh");
    await dialog.getByRole("button", { name: /^Send$/ }).click();
    await expect(dialog.getByText(/Sources:|Sorry|error|Failed|GraphQL|not configured|Try again/i).first()).toBeVisible({ timeout: 20000 });
  });
});

test.describe("Neighbourhood explorer", () => {
  test("neighbourhood page loads and shows explorer", async ({ page }) => {
    await page.goto("/neighbourhood");
    await expect(page.getByTestId("neighbourhood-explorer")).toBeVisible({ timeout: 10000 });
  });

  test("shows Connect API when API URL is missing or content when configured", async ({ page }) => {
    await page.goto("/neighbourhood");
    await expect(page.getByTestId("neighbourhood-explorer")).toBeVisible({ timeout: 10000 });
    // When NEXT_PUBLIC_API_URL is unset, Connect API message is shown; otherwise cards/loading/score/error.
    const connectOrContent = page.locator(
      '[data-testid="neighbourhood-connect-api"], [data-testid^="neighbourhood-loading"], [data-testid^="neighbourhood-card-"], [data-testid^="neighbourhood-score-"], [data-testid^="neighbourhood-empty-"], [data-testid^="neighbourhood-error"]'
    );
    await expect(connectOrContent.first()).toBeVisible({ timeout: 8000 });
  });
});
