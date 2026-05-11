/**
 * File:        src/lib/utils.ts
 * Module:      Owner Dashboard — Utilities
 * Purpose:     Shared utility functions (cn className merger, formatters)
 *
 * Exports:
 *   - cn(...inputs) → string          — merge classNames with tailwind-merge
 *   - formatCurrency(n) → string     — INR currency formatter
 *   - formatDate(dateStr) → string    — short date formatter
 *   - formatRelativeTime(dateStr) → string — "2 hours ago" style
 *
 * Depends on:
 *   - clsx, tailwind-merge
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}
