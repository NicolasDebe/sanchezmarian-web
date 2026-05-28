import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { ServiciosPageSections } from "@/components/servicios-page-sections"
import { CtaFinal } from "@/components/cta-final"

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
      <PageHero
        eyebrow="Servicios"
        title="Lo que hacemos"
        titleAccent="juntos."
        subtitle="Tres servicios diseñados para construir tu presencia donde tiene que estar: en los medios y en la mente de tu audiencia."
      />
      <ServiciosPageSections />
      <CtaFinal />
      <Footer />
    </main>
  )
}
