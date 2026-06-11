import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CampanasContent } from "@/components/campanas-content"
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
    <main>
      <Nav />
      <CampanasContent campaigns={campaigns} />
      <Footer />
    </main>
  )
}
