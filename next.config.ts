import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@react-pdf/renderer', '@prisma/client', '@prisma/adapter-pg', '.prisma/client', 'pg'],
};

export default nextConfig;
