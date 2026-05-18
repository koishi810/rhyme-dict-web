import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // only static-export in production (GitHub Pages); dev mode skips this so dynamic routes work
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  images: { unoptimized: true },
  basePath: '/rhyme-dict-web',
  assetPrefix: '/rhyme-dict-web',
  turbopack: { root: process.cwd() },
};

export default nextConfig;
