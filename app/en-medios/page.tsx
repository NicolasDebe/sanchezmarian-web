import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { CtaFinal } from "@/components/cta-final"
import { MediaGrid } from "./media-grid"

export const metadata: Metadata = {
  title: "Casos de éxito — Marian Sánchez",
  description:
    "Portfolio de apariciones en medios: La Nación, Infobae, Los Andes, MDZ Online, Clarín y más. Resultados reales para clientes reales.",
  openGraph: {
    title: "Casos de éxito — Marian Sánchez",
    description:
      "100+ apariciones en medios nacionales y provinciales. Portfolio de resultados de GB Consulting.",
    url: "https://sanchezmarian.com/en-medios",
  },
}

export default function EnMediosPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Casos de éxito"
        title="Historias que"
        titleAccent="llegaron a los medios."
        subtitle="100+ apariciones en medios nacionales, provinciales y locales. Cada una, el resultado de una estrategia bien construida."
      />

      {/* Stats rápidas */}
      <section className="bg-marino-osc py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "100+", label: "Apariciones totales" },
              { n: "15+", label: "Medios distintos" },
              { n: "4", label: "Formatos: digital, gráfico, radio, TV" },
              { n: "10+ años", label: "Construyendo relaciones" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-playfair font-bold text-white text-3xl sm:text-4xl">{s.n}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 mt-2 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid con filtros */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <MediaGrid />
        </div>
      </section>

      <CtaFinal />
      <Footer />
    </main>
  )
}
