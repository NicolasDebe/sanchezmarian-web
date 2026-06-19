import type { Metadata } from "next"
import { CampanasContent } from "@/components/campanas-content"
import { MobileCtaBar } from "@/components/ui/mobile-cta-bar"
import { getPublicCampaigns } from "@/lib/campaigns"

// Igual que el home: estática con revalidación. getPublicCampaigns nunca
// tira excepción (fallback hardcoded), así el build jamás rompe por Supabase.
export const revalidate = 60

export const metadata: Metadata = {
  title: "Campañas activas — Marian Sánchez",
  description:
    "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
  openGraph: {
    title: "Campañas activas — Marian Sánchez",
    description:
      "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
    url: "https://sanchezmarian.com/campanas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campañas activas — Marian Sánchez",
    description:
      "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
  },
}

export default async function CampanasPage() {
  const campaigns = await getPublicCampaigns()

  return (
    <>
      <CampanasContent campaigns={campaigns} />
      <MobileCtaBar label="Hablemos" />
    </>
  )
}
