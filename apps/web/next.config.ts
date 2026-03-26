/**
 * @file next.config.ts
 * @module web
 * @description Next.js config: security headers, CSP, rewrites, standalone, images.
 * @author BharatERP
 * @created 2026-03-19
 */

import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

/** Walk up until nx.json (workspace root) so Turbopack resolves one React instance in the monorepo. */
function resolveTurbopackRoot(): string {
  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "nx.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(process.cwd(), "../..");
}

// Include the configured API origin in CSP so direct API calls are allowed
// when NEXT_PUBLIC_API_URL points to a cross-origin host.
function parseOrigin(rawUrl: string | undefined): { origin: string; host: string } {
  if (!rawUrl) return { origin: "", host: "" };
  try {
    const u = new URL(rawUrl);
    return { origin: u.origin, host: u.host };
  } catch {
    return { origin: "", host: "" };
  }
}

const { origin: apiOrigin, host: apiHost } = parseOrigin(process.env.NEXT_PUBLIC_API_URL);
const graphqlOrigin = parseOrigin(process.env.NEXT_PUBLIC_GRAPHQL_HTTP).origin;

// WebSocket origin: allow wss: on the API host (or all wss: in dev / when unset)
const wsOrigin = apiHost ? `wss://${apiHost}` : "wss:";

/** Origins the browser may fetch (GraphQL, uploads) when env points at a separate API host. */
const connectSrcApiOrigins = [...new Set([apiOrigin, graphqlOrigin].filter(Boolean))];

const connectSrcParts = [
  "'self'",
  "https://*.anthropic.com",
  "https://*.openai.com",
  wsOrigin,
  ...connectSrcApiOrigins,
];

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.amazonaws.com https://*.s3.*.amazonaws.com https://unpkg.com",
      `connect-src ${connectSrcParts.join(" ")}`,
      "frame-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",

  turbopack: {
    root: resolveTurbopackRoot(),
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86_400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "https", hostname: "unpkg.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },

  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/buy", destination: "/search?type=apartment", permanent: true },
      { source: "/rent", destination: "/search?listingFor=rent", permanent: true },
    ];
  },

  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
    return {
      // beforeFiles rewrites run before filesystem routes are checked.
      // We place the Nest proxy here but exclude /api/auth/* so that
      // Next.js App Router route handlers (login, logout, me) are served
      // by the local filesystem and not forwarded to the Nest backend.
      beforeFiles: [],
      // afterFiles rewrites run after filesystem routes (app/ and pages/)
      // are checked. /api/auth/* will resolve to the Next.js route handlers
      // before reaching here; all other /api/* paths proxy to Nest.
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
        {
          source: "/health/:path*",
          destination: `${apiBase}/health/:path*`,
        },
      ],
      fallback: [],
    };
  },

  transpilePackages: ["@property-app-ai/shared"],
};

export default nextConfig;
