import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // only static-export in production (GitHub Pages); dev mode skips this so dynamic routes work
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  images: { unoptimized: true },
  basePath: '/rhyme-dict-web',
  assetPrefix: '/rhyme-dict-web',
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
