/** @type {import('next').NextConfig} */
const nextConfig = {
  appDir: true,
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;