import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
