import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
