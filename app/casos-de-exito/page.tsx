import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CtaFinal } from "@/components/cta-final"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { CasosClient } from "./casos-client"

export const metadata: Metadata = {
  title: "Casos de éxito — Marian Sánchez",
  description:
    "100+ apariciones en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para clientes reales.",
  openGraph: {
    title: "Casos de éxito — Marian Sánchez",
    description:
      "100+ apariciones en medios nacionales e internacionales. Portfolio de gestiones de GB Consulting.",
    url: "https://sanchezmarian.com/casos-de-exito",
  },
}

const STATS = [
  { n: "100+", label: "apariciones verificadas" },
  { n: "30+", label: "medios distintos" },
  { n: "5", label: "formatos cubiertos" },
  { n: "15", label: "clientes activos" },
] as const

export default function CasosDeExitoPage() {
  return (
    <main>
      <Nav />

      {/* ━━━━ PARTE 1 — HERO ━━━━ */}
      <section
        className="relative bg-hueso overflow-hidden"
        style={{ paddingTop: 160, paddingBottom: 80 }}
      >
        <TextureOverlay texture="paperGrain" opacity={0.25} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">

          {/* Eyebrow */}
          <p
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--color-bordo)" }}
          >
            Casos de éxito
          </p>

          {/* Decorative line */}
          <div
            className="mt-4 mb-4"
            style={{ width: 40, height: 1, background: "var(--color-dorado)" }}
          />

          {/* Título */}
          <h1
            className="font-playfair font-bold leading-[1.1]"
            style={{
              color: "var(--color-negro-bordo)",
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              maxWidth: 700,
            }}
          >
            El impacto de una buena estrategia
            <br />
            <em className="italic" style={{ color: "var(--color-bordo)" }}>
              se mide en presencia real.
            </em>
          </h1>

          {/* Subtítulo */}
          <p
            className="font-sans mt-6"
            style={{
              fontSize: 16,
              color: "var(--color-gris-bordo)",
              maxWidth: 560,
              lineHeight: 1.7,
            }}
          >
            Una selección de gestiones de prensa realizadas para marcas, empresas y
            profesionales que confiaron en la estrategia. Cada caso cuenta una historia.
          </p>

          {/* Stats — desktop: fila con separadores */}
          <div className="hidden sm:flex items-center gap-0 mt-[60px]">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && (
                  <div
                    className="self-stretch mx-8"
                    style={{
                      width: 1,
                      background: "rgba(201,168,130,0.3)",
                    }}
                  />
                )}
                <div>
                  <p
                    className="font-playfair leading-none"
                    style={{ fontSize: 48, color: "var(--color-bordo)" }}
                  >
                    {s.n}
                  </p>
                  <p
                    className="font-mono text-[11px] uppercase mt-2"
                    style={{
                      color: "var(--color-gris-bordo)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats — mobile: grid 2×2 */}
          <div className="grid grid-cols-2 gap-8 mt-[60px] sm:hidden">
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  className="font-playfair leading-none"
                  style={{ fontSize: 36, color: "var(--color-bordo)" }}
                >
                  {s.n}
                </p>
                <p
                  className="font-mono text-[11px] uppercase mt-2"
                  style={{
                    color: "var(--color-gris-bordo)",
                    letterSpacing: "0.12em",
                    lineHeight: 1.4,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ━━━━ PARTES 2 + 3 — FILTROS + BLOQUES ━━━━ */}
      <section className="bg-hueso" style={{ paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <CasosClient />
        </div>
      </section>

      {/* ━━━━ PARTE 4 — CTA FINAL ━━━━ */}
      <CtaFinal />
      <Footer />
    </main>
  )
}
