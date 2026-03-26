/**
 * @file vitest.config.ts
 * @module admin
 * @description Vitest config for admin panel unit tests.
 * @author BharatERP
 * @created 2026-03-26
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@property-app-ai/shared": path.resolve(
        __dirname,
        "../../libs/shared/src"
      ),
    },
  },
});
