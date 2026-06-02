import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CasosClient } from "./casos-client"

export const metadata: Metadata = {
  title: "Casos de éxito — Marian Sánchez",
  description:
    "56 coberturas en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para marcas reales.",
  openGraph: {
    title: "Casos de éxito — Marian Sánchez",
    description:
      "56 coberturas en medios nacionales e internacionales. Portfolio de gestiones de GB Consulting.",
    url: "https://sanchezmarian.com/casos-de-exito",
  },
}

export default function CasosDeExitoPage() {
  return (
    <main>
      <Nav />
      <CasosClient />
      <Footer />
    </main>
  )
}
