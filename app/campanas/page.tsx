import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CampanasContent } from "@/components/campanas-content"
import { getAllCampaigns } from "@/lib/campaigns"

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
  let campaigns: Awaited<ReturnType<typeof getAllCampaigns>> = []
  try {
    campaigns = await getAllCampaigns()
  } catch {
    // Supabase no disponible en build (env vars no configuradas)
  }

  return (
    <main>
      <Nav />
      <CampanasContent campaigns={campaigns} />
      <Footer />
    </main>
  )
}
