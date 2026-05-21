import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"

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

const HITOS = [
  "Más de una década en comunicación",
  "100+ apariciones en medios documentadas",
  "10+ clientes transformados y en crecimiento",
  "Metodología probada, orgánica y replicable",
]

const PILARES = [
  {
    eyebrow: "Construcción",
    title: "Relaciones reales con periodistas",
    body: "Mis contactos no son números en una base de datos. Son vínculos genuinos construidos durante más de una década en los medios de Mendoza. Conozco quiénes son, qué buscan, y cómo presentar tu marca para que se convierta en una noticia de valor.",
  },
  {
    eyebrow: "Estrategia",
    title: "Mensaje correcto en el momento preciso",
    body: "No creo en soluciones estándar. Antes de hablar con un periodista, trabajamos juntos para definir qué historia contar y a quién. El mensaje bien diseñado multiplica los resultados y garantiza que tu voz llegue a la audiencia indicada.",
  },
  {
    eyebrow: "Resultados",
    title: "Impacto medible y documentado",
    body: "Lo que no se mide, no se puede mejorar. Cada aparición en medios, nota y entrevista queda registrada. Recibís un clipping detallado con análisis de impacto y proyecciones para las próximas etapas de crecimiento.",
  },
]

export default function SobreMarianPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Sobre Marian"
        title="Marian Sánchez,"
        titleAccent="estratega de comunicación."
        subtitle="Más de una década construyendo relaciones con periodistas y resultados reales para marcas y profesionales en Argentina."
      />

      {/* Bio principal */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Foto placeholder */}
          <div className="relative">
            <div className="absolute top-5 left-5 w-full aspect-[3/4] max-w-[420px] rounded-[2rem] border-2 border-lino pointer-events-none" />
            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-[2rem] rounded-tr-[4rem] overflow-hidden bg-lino">
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-40">
                <div className="w-24 h-24 rounded-full bg-marino/30" />
                <div className="w-32 h-3 rounded-full bg-marino/20" />
                <p className="font-mono text-xs text-marino/50 uppercase tracking-widest mt-1">
                  Foto · Marian
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 lg:-right-6 bg-marino text-white px-5 py-4 rounded-2xl shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Más de una</p>
              <p className="font-playfair font-bold text-2xl leading-none">década</p>
              <p className="font-sans text-xs text-white/70 mt-0.5">en comunicación</p>
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4 font-sans text-gris-tx text-base leading-relaxed">
              <p>
                Mi nombre es Marian Sánchez y ayudo a empresas y marcas personales
                a transformar su propósito en noticias, conectando su propuesta de
                valor con los canales de comunicación adecuados. Llevo más de una
                década construyendo vínculos reales con los protagonistas de los
                medios locales.
              </p>
              <p>
                Mi enfoque no se limita a la difusión masiva; se basa en el vínculo
                real. Entiendo el ADN de cada cliente para identificar exactamente
                qué periodista o medio de comunicación está buscando esa historia.
                Diseño estrategias personalizadas, adaptadas a las necesidades de cada
                proyecto, porque cada marca tiene un ritmo, un tono y un objetivo diferente.
              </p>
              <p>
                Entiendo la comunicación como una sinergia donde todas las partes
                ganan. Mi metodología no solo busca el beneficio del cliente, sino
                que se enfoca en brindar un valor agregado al periodista. Al entregar
                contenido de calidad, chequeado y de interés genuino, facilito la
                labor informativa de los medios, generando una relación de respeto y
                colaboración que perdura en el tiempo.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-marino/10">
              {[
                { n: "100+", label: "Apariciones en medios" },
                { n: "10+", label: "Clientes activos" },
                { n: "10+ años", label: "De experiencia" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-playfair font-bold text-marino text-2xl lg:text-3xl">{stat.n}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-gris-tx/60 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-terracota text-white px-6 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 transition-colors group w-fit"
            >
              Conversemos
              <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hitos de impacto */}
      <section className="bg-arena py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
            Hitos de impacto
          </p>
          <h2 className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.75rem] leading-[1.1] mb-16 max-w-xl">
            <span className="block">Resultados que</span>
            <em className="block italic text-terracota">hablan solos.</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HITOS.map((hito) => (
              <div
                key={hito}
                className="bg-hueso-oscuro border-l-[3px] border-bordo rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1"
              >
                <p className="font-sans text-negro-bordo text-sm leading-relaxed font-medium">
                  {hito}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tres Pilares */}
      <section className="bg-hueso-oscuro py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Header centrado */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="font-playfair font-bold italic text-negro-bordo text-[2.75rem] sm:text-[3.25rem] lg:text-[2.75rem] leading-[1.1] mb-4">
              El diferencial
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bordo">
              En qué creo cuando trabajo
            </p>
          </div>

          {/* Tres columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {PILARES.map((pilar, i) => (
              <div key={pilar.eyebrow} className="relative px-0 lg:px-10 py-10 lg:py-0">
                {/* Línea vertical entre columnas */}
                {i < PILARES.length - 1 && (
                  <span className="hidden lg:block absolute right-0 top-0 w-px h-full bg-dorado/40" />
                )}

                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bordo mb-5">
                  {pilar.eyebrow}
                </p>
                <h3 className="font-playfair italic font-bold text-negro-bordo text-[1.5rem] leading-snug mb-5">
                  {pilar.title}
                </h3>
                <p className="font-sans text-gris-bordo text-[14px] leading-relaxed">
                  {pilar.body}
                </p>

                {/* Separador horizontal en mobile */}
                {i < PILARES.length - 1 && (
                  <span className="lg:hidden block w-full h-px bg-dorado/30 mt-10" />
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] leading-[1.1] mb-5">
            ¿Trabajamos juntos?
          </h2>
          <p className="font-sans text-gris-tx text-base leading-relaxed mb-8 max-w-md mx-auto">
            Conversemos sobre tu proyecto y encontremos la mejor forma de trabajar juntos.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-terracota text-white px-8 py-4 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 transition-colors group"
          >
            Conversemos
            <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
