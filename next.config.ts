import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El upload de fotos de campañas va por server action (máx. 5MB por foto).
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ncokwdodsvrmkoimvdwg.supabase.co",
      },
    ],
  },
};

export default nextConfig;
