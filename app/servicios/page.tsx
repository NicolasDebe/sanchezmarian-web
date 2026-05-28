import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ServiciosPageSections } from "@/components/servicios-page-sections"

export const metadata: Metadata = {
  title: "Servicios — Marian Sánchez",
  description:
    "Prensa y Comunicación, Comunicación Estratégica y Relaciones Públicas. Descubrí cómo puedo ayudarte a posicionarte en los medios.",
  openGraph: {
    title: "Servicios — Marian Sánchez",
    description:
      "Prensa y Comunicación, Comunicación Estratégica y Relaciones Públicas.",
    url: "https://sanchezmarian.com/servicios",
  },
}

export default function ServiciosPage() {
  return (
    <main>
      <Nav />
      <ServiciosPageSections />
      <Footer />
    </main>
  )
}
