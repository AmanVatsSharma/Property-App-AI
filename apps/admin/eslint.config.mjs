/**
 * @file eslint.config.mjs
 * @module admin
 * @description ESLint flat config for admin app (Next.js).
 * @author BharatERP
 * @created 2025-03-13
 */
import { globalIgnores } from "eslint/config";

export default [
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];
