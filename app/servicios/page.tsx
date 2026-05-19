import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
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

const SERVICIOS = [
  {
    num: "01",
    name: "Prensa y Comunicación",
    tagline: "Tu historia en los medios que importan.",
    description:
      "Gestión orgánica de presencia en medios para transformar tus hitos, lanzamientos o novedades en contenido de valor periodístico. Con más de una década de experiencia en el ecosistema de medios de Mendoza, me encargo de que tu mensaje llegue al periodista adecuado, en el momento justo y con el enfoque correcto.",
    includes: [
      "Estrategia de relaciones con medios locales, provinciales y nacionales",
      "Redacción de gacetillas y comunicados de prensa",
      "Gestión y coordinación de entrevistas",
      "Asesoría para responder consultas periodísticas",
      "Seguimiento de publicaciones y reporte mensual",
    ],
    forWho:
      "Marcas, profesionales y emprendedores que quieren posicionarse como referentes en su industria.",
    sectionBg: "bg-white",
    textColor: "text-marino",
    boxBg: "bg-arena",
    borderColor: "border-marino/8",
    checkColor: "text-terracota",
    accentText: "text-gris-tx",
  },
  {
    num: "02",
    name: "Comunicación Estratégica",
    tagline: "Tu plan de comunicación, alineado a tus objetivos reales.",
    description:
      "Diseño de planes de comunicación a medida — mensuales, trimestrales o anuales — según las necesidades de cada etapa de tu proyecto. Analizamos qué historia contar, a quién hablarle y cómo hacerlo, alineando cada acción con tus objetivos de negocio o posicionamiento personal.",
    includes: [
      "Diagnóstico de comunicación actual",
      "Definición de posicionamiento y mensajes clave",
      "Plan de comunicación mensual, trimestral o anual",
      "Selección de canales y medios prioritarios",
      "Acompañamiento y ajuste de estrategia",
    ],
    forWho:
      "Negocios en crecimiento que necesitan comunicar ese crecimiento de forma ordenada y profesional.",
    sectionBg: "bg-marino-osc",
    textColor: "text-white",
    boxBg: "bg-white/6",
    borderColor: "border-white/10",
    checkColor: "text-terracota",
    accentText: "text-white/60",
  },
  {
    num: "03",
    name: "Relaciones Públicas",
    tagline: "Reputación y vínculos que construyen visibilidad sostenida.",
    description:
      "Gestión de relaciones institucionales y networking para fortalecer la reputación de marcas y personas. Actúo como nexo estratégico para generar alianzas, coordinar presencia en eventos clave y facilitar el contacto con actores relevantes.",
    includes: [
      "Gestión de relaciones institucionales y con medios",
      "Representación y networking en eventos clave",
      "Coordinación de alianzas estratégicas",
      "Manejo de imagen y reputación pública",
      "Acompañamiento continuo y construcción de vínculos",
    ],
    forWho:
      "Marcas y personas que buscan construir confianza y visibilidad sostenida en el tiempo.",
    sectionBg: "bg-arena",
    textColor: "text-marino",
    boxBg: "bg-white/70",
    borderColor: "border-marino/8",
    checkColor: "text-terracota",
    accentText: "text-gris-tx",
  },
]

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

      {SERVICIOS.map((s) => (
        <section key={s.num} className={`${s.sectionBg} py-24 lg:py-28`}>
          <div
            className={`max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start`}
          >
            {/* Left — info */}
            <div className="flex flex-col gap-6">
              <span className={`font-mono text-[11px] uppercase tracking-widest ${s.accentText} opacity-60`}>
                {s.num}
              </span>

              <h2 className={`font-playfair font-bold text-[2.25rem] sm:text-[2.75rem] leading-[1.1] ${s.textColor}`}>
                {s.name}
              </h2>

              <p className={`font-playfair italic text-xl leading-snug ${s.accentText}`}>
                {s.tagline}
              </p>

              <p className={`font-sans text-base leading-relaxed ${s.accentText}`}>
                {s.description}
              </p>

              <div className={`pt-2 border-t ${s.borderColor}`}>
                <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${s.accentText} opacity-60`}>
                  Para quién
                </p>
                <p className={`font-sans text-sm leading-relaxed ${s.accentText}`}>
                  {s.forWho}
                </p>
              </div>

              <Link
                href="/contacto"
                className={`inline-flex items-center gap-2 font-sans text-sm font-semibold group transition-colors w-fit ${
                  s.sectionBg === "bg-white" || s.sectionBg === "bg-arena"
                    ? "text-marino hover:text-terracota"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Consultar por este servicio
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Right — includes */}
            <div className={`${s.boxBg} rounded-2xl p-8 border ${s.borderColor}`}>
              <p className={`font-mono text-[10px] uppercase tracking-widest mb-6 ${s.accentText} opacity-50`}>
                Qué incluye
              </p>
              <ul className="flex flex-col gap-4">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle
                      size={15}
                      className={`mt-[2px] shrink-0 ${s.checkColor}`}
                      strokeWidth={1.5}
                    />
                    <span className={`font-sans text-sm leading-relaxed ${s.accentText}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <CtaFinal />
      <Footer />
    </main>
  )
}
