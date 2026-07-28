import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.8"],
  experimental: {
    // Force webpack to reduce memory usage
    webpackBuildWorker: true,
  },
};

export default nextConfig;
