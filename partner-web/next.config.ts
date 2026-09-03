import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow following directory junctions/symlinks that point outside this
  // project's root (e.g. shared code junctioned from admin-web).
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
