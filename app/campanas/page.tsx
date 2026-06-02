import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CampanasContent } from "@/components/campanas-content"

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

export default function CampanasPage() {
  return (
    <main>
      <Nav />
      <CampanasContent />
      <Footer />
    </main>
  )
}
