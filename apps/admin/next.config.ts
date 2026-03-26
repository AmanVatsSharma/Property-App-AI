/**
 * @file next.config.ts
 * @module admin
 * @description Next.js config for admin panel: security headers, transpilePackages, rewrites.
 * @author BharatERP
 * @created 2026-03-26
 */

import type { NextConfig } from "next";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_API_URL).origin;
      } catch {
        return "";
      }
    })()
  : "";

const connectSrcParts = [
  "'self'",
  ...(apiOrigin && apiOrigin !== "http://localhost:3333" ? [apiOrigin] : []),
];

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob: https://*.amazonaws.com",
      `connect-src ${connectSrcParts.join(" ")}`,
      "frame-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",

  transpilePackages: ["@property-app-ai/shared"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
    return {
      // afterFiles rewrites run after Next.js filesystem routes are matched.
      // /api/auth/* resolves to the local App Router route handlers first;
      // all other /api/* paths proxy to the Nest backend.
      beforeFiles: [],
      afterFiles: [
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
        {
          source: "/api/:path*",
          destination: `${apiBase}/api/:path*`,
        },
        {
          source: "/graphql",
          destination: `${apiBase}/graphql`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
