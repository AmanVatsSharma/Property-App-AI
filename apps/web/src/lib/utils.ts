/**
 * @file utils.ts
 * @module lib
 * @description Utility functions: cn() for merging Tailwind classes
 * @author BharatERP
 * @created 2026-03-26
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
