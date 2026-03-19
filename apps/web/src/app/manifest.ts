/**
 * @file manifest.ts
 * @module app
 * @description Typed PWA manifest route for UrbanNest.ai.
 * @author BharatERP
 * @created 2026-03-19
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UrbanNest.ai",
    short_name: "UrbanNest",
    description: "India's AI-powered real estate platform",
    start_url: "/",
    display: "standalone",
    background_color: "#080c14",
    theme_color: "#00d4aa",
    orientation: "portrait-primary",
    categories: ["real estate", "property", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search Properties", url: "/search", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
      { name: "Post Property", url: "/post-property", icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }] },
    ],
  };
}
