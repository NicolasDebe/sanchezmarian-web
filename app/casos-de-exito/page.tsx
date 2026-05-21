import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CtaFinal } from "@/components/cta-final"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { MediaGrid } from "./media-grid"

export const metadata: Metadata = {
  title: "Casos de éxito — Marian Sánchez",
  description:
    "56 apariciones verificadas en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para clientes reales.",
  openGraph: {
    title: "Casos de éxito — Marian Sánchez",
    description:
      "56 apariciones verificadas en medios nacionales e internacionales. Portfolio de gestiones de GB Consulting.",
    url: "https://sanchezmarian.com/casos-de-exito",
  },
}

export default function CasosDeExitoPage() {
  return (
    <main>
      <Nav />

      {/* Hero custom */}
      <section className="relative pt-20 bg-arena overflow-hidden">
        <TextureOverlay texture="paperGrain" opacity={0.3} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bordo mb-5">
            Casos de éxito
          </p>
          <h1 className="font-playfair font-bold text-negro-bordo leading-[1.1] text-[2.75rem] sm:text-[3.75rem] lg:text-[5rem] max-w-3xl mb-6">
            56 apariciones{" "}
            <em className="italic text-bordo">reales</em>{" "}
            en medios.
          </h1>
          <p className="font-sans text-gris-bordo text-base sm:text-lg leading-relaxed max-w-xl">
            Una selección de gestiones de prensa realizadas para marcas, empresas y profesionales
            que confiaron en mi visión.
          </p>
        </div>
      </section>

      {/* Stats reales */}
      <section className="bg-marino-osc py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "56", label: "Apariciones verificadas" },
              { n: "30+", label: "Medios distintos" },
              { n: "5", label: "Formatos: digital, gráfico, radio, TV, streaming" },
              { n: "4", label: "Clientes activos con cobertura" },
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
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <MediaGrid />
        </div>
      </section>

      <CtaFinal />
      <Footer />
    </main>
  )
}
