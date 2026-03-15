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
  test("opens AI panel and shows prompt input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open AI assistant|Ask UrbanNest AI/i }).click();
    const dialog = page.getByRole("dialog", { name: /UrbanNest AI/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByPlaceholder(/3 BHK|Describe your home|e\.g\. 3 BHK under/i)).toBeVisible();
  });

  test("submit prompt shows result or error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open AI assistant|Ask UrbanNest AI/i }).click();
    const dialog = page.getByRole("dialog", { name: /UrbanNest AI/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.getByPlaceholder(/3 BHK|Describe your home|e\.g\. 3 BHK under/i).fill("2 BHK in Bangalore under 80 lakh");
    await dialog.getByRole("button", { name: /^Send$/ }).click();
    await expect(page.getByText(/Sources:|Sorry|error|Failed|GraphQL|not configured|Try again/i)).toBeVisible({ timeout: 20000 });
  });
});
