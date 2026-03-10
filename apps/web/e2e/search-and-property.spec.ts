/**
 * @file search-and-property.spec.ts
 * @module e2e
 * @description E2E: search page and property detail flow
 * @author BharatERP
 * @created 2025-03-10
 */

import { test, expect } from "@playwright/test";

test.describe("Search and property detail", () => {
  test("search page loads and shows property cards", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: /search/i }).or(page.locator(".search-top-bar"))).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".prop-card").first()).toBeVisible({ timeout: 5000 });
  });

  test("property detail page loads for known slug", async ({ page }) => {
    await page.goto("/property/sobha-city-vista");
    await expect(page.getByText(/Sobha City Vista/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/₹2.85 Cr/)).toBeVisible();
  });

  test("search URL state: sort param reflected", async ({ page }) => {
    await page.goto("/search?sort=price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const sortSelect = page.locator(".sort-select");
    await expect(sortSelect).toHaveValue("price-asc");
  });
});
