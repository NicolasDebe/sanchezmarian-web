import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El upload de fotos de campañas va por server action (máx. 5MB por foto).
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // Next 16 exige declarar las calidades permitidas. 75 = default del resto
    // del sitio; 90 = imágenes hero (mejor nitidez en el LCP).
    qualities: [75, 90],
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
