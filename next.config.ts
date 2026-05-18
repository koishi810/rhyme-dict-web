import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/rhyme-dict-web',
  assetPrefix: '/rhyme-dict-web',
};

export default nextConfig;
