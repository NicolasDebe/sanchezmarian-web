"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import {
  fadeUp, fadeLeft, fadeRight, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"

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
    forWho: "Marcas, profesionales y emprendedores que quieren posicionarse como referentes en su industria.",
    ctaLabel: "Quiero gestionar mi prensa",
    ctaHref: "/contacto?servicio=prensa",
    sectionBg: "bg-white",
    textColor: "text-marino",
    boxBg: "bg-arena",
    borderColor: "border-marino/8",
    checkColor: "text-terracota",
    accentText: "text-gris-tx",
    isLight: true,
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
    forWho: "Negocios en crecimiento que necesitan comunicar ese crecimiento de forma ordenada y profesional.",
    ctaLabel: "Necesito un plan estratégico",
    ctaHref: "/contacto?servicio=estrategia",
    sectionBg: "bg-marino-osc",
    textColor: "text-white",
    boxBg: "bg-white/6",
    borderColor: "border-white/10",
    checkColor: "text-terracota",
    accentText: "text-white/60",
    isLight: false,
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
    forWho: "Marcas y personas que buscan construir confianza y visibilidad sostenida en el tiempo.",
    ctaLabel: "Quiero fortalecer mis relaciones públicas",
    ctaHref: "/contacto?servicio=rrpp",
    sectionBg: "bg-arena",
    textColor: "text-marino",
    boxBg: "bg-white/70",
    borderColor: "border-marino/8",
    checkColor: "text-terracota",
    accentText: "text-gris-tx",
    isLight: true,
  },
]

const PASOS = [
  { num: "01", title: "Definición del relato y audiencia", body: "Qué historia contar y a quién dirigirla." },
  { num: "02", title: "Diseño de la estrategia", body: "Plan de comunicación a medida para tu proyecto." },
  { num: "03", title: "Gestión de contenidos y relacionamiento", body: "Activo mi red de contactos en medios de Mendoza." },
  { num: "04", title: "Monitoreo", body: "Superviso cada interacción y ajusto en tiempo real." },
  { num: "05", title: "Análisis de impacto y proyecciones", body: "Clipping detallado con resultados medibles y próximas etapas." },
]

export function ServiciosPageSections() {
  return (
    <>
      {/* ── Servicios detalle ── */}
      {SERVICIOS.map((s) => (
        <section key={s.num} className={`${s.sectionBg} py-24 lg:py-28`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left — info */}
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="flex flex-col gap-6"
            >
              <motion.div
                variants={fadeUpStagger}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="flex flex-col gap-6"
              >
                <motion.span variants={fadeUp} className={`font-mono text-[11px] uppercase tracking-widest ${s.accentText} opacity-60`}>
                  {s.num}
                </motion.span>
                <motion.h2 variants={fadeUp} className={`font-playfair font-bold text-[2.25rem] sm:text-[2.75rem] leading-[1.1] ${s.textColor}`}>
                  {s.name}
                </motion.h2>
                <motion.p variants={fadeUp} className={`font-playfair italic text-xl leading-snug ${s.accentText}`}>
                  {s.tagline}
                </motion.p>
                <motion.p variants={fadeUp} className={`font-sans text-base leading-relaxed ${s.accentText}`}>
                  {s.description}
                </motion.p>
                <motion.div variants={fadeUp} className={`pt-2 border-t ${s.borderColor}`}>
                  <p className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${s.accentText} opacity-60`}>
                    Para quién
                  </p>
                  <p className={`font-sans text-sm leading-relaxed ${s.accentText}`}>
                    {s.forWho}
                  </p>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <Link
                    href={s.ctaHref}
                    className={`inline-flex items-center gap-2 font-sans text-sm font-semibold group transition-colors w-fit ${
                      s.isLight ? "text-marino hover:text-terracota" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {s.ctaLabel}
                    <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right — includes */}
            <motion.div
              variants={revealCard}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className={`${s.boxBg} rounded-2xl p-8 border ${s.borderColor}`}
            >
              <p className={`font-mono text-[10px] uppercase tracking-widest mb-6 ${s.accentText} opacity-50`}>
                Qué incluye
              </p>
              <ul className="flex flex-col gap-4">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={15} className={`mt-[2px] shrink-0 ${s.checkColor}`} strokeWidth={1.5} />
                    <span className={`font-sans text-sm leading-relaxed ${s.accentText}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </section>
      ))}

      {/* ── Mi método de trabajo ── */}
      <section className="bg-hueso py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mb-14 lg:mb-16"
          >
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.28em] text-bordo mb-4">
              Cómo trabajo
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.1]">
              Mi método de trabajo
            </motion.h2>
          </motion.div>

          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="max-w-2xl"
          >
            {PASOS.map((paso, i) => {
              const isLast = i === PASOS.length - 1
              return (
                <motion.div key={paso.num} variants={fadeLeft} className="flex gap-8">
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <span className="font-playfair italic font-bold text-bordo text-[2rem] leading-none">
                      {paso.num}
                    </span>
                    {!isLast && <div className="flex-1 w-px bg-dorado/50 my-3 min-h-[2.5rem]" />}
                  </div>
                  <div className={`flex flex-col gap-1 ${isLast ? "" : "pb-10"}`}>
                    <p className="font-sans font-semibold text-negro-bordo text-base">{paso.title}</p>
                    <p className="font-sans text-gris-bordo text-sm leading-relaxed">{paso.body}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-16 max-w-2xl border-l-[3px] border-bordo bg-arena rounded-r-xl px-8 py-7"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bordo mb-4">
              ¿Por qué este método funciona?
            </p>
            <p className="font-sans text-gris-tx text-base leading-relaxed">
              Porque cuento con el respaldo de años de relación diaria con los protagonistas
              de los medios locales. Conozco qué buscan los periodistas y sé cómo presentar
              tu marca para que se convierta en una noticia de valor.
            </p>
          </motion.div>

        </div>
      </section>
    </>
  )
}
