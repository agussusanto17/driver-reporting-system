import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Ensure uploads directory is not processed by Next.js
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
