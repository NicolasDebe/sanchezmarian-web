import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { MisValoresSections } from "@/components/mis-valores-sections"

export const metadata: Metadata = {
  title: "Mis valores — Marian Sánchez",
  description:
    "Conocé la historia y los pilares que guían el trabajo de Marian Sánchez: inteligencia, integridad, libertad, compromiso y pasión por la comunicación.",
  openGraph: {
    title: "Mis valores — Marian Sánchez",
    description:
      "Conocé la historia y los pilares que guían el trabajo de Marian Sánchez en comunicación estratégica.",
    url: "https://sanchezmarian.com/mis-valores",
  },
}

export default function MisValoresPage() {
  return (
    <main>
      <Nav />
      <MisValoresSections />
      <Footer />
    </main>
  )
}
