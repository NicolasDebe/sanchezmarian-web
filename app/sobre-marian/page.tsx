import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { SobreMarianSections } from "@/components/sobre-marian-sections"

export const metadata: Metadata = {
  title: "Sobre Marian — Marian Sánchez",
  description:
    "Estratega de comunicación en Mendoza. Más de 10 años construyendo relaciones reales con periodistas. 100+ apariciones en medios.",
  openGraph: {
    title: "Sobre Marian — Marian Sánchez",
    description:
      "Estratega de comunicación en Mendoza. 100+ apariciones en medios documentadas.",
    url: "https://sanchezmarian.com/sobre-marian",
  },
}

export default function SobreMarianPage() {
  return (
    <main>
      <Nav />
      <SobreMarianSections />
      <Footer />
    </main>
  )
}
