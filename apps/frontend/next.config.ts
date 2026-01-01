import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      // Cloudflare R2 public bucket URL (user's specific bucket)
      {
        protocol: "https",
        hostname: "pub-22eef05c3ef04dcb91447dad63106f1a.r2.dev",
      },
      // Cloudflare R2 generic patterns
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Unsplash images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
