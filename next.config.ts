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
  async redirects() {
    return [
      {
        // /sobre-marian se unificó en /mis-valores (página canónica).
        // permanent: true → 308 (redirect permanente, equivalente SEO al 301
        // y recomendado por Next porque preserva el método de la request).
        source: "/sobre-marian",
        destination: "/mis-valores",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
