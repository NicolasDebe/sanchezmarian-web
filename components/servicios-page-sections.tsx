"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import {
  fadeUp, fadeLeft, fadeRight, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"
import { TimelineRelacionesPublicas } from "@/components/timeline-relaciones-publicas"

/* ─── data ───────────────────────────────────────────────────── */
const PRENSA_INCLUDES = [
  "Estrategia de relaciones con medios locales, provinciales y nacionales",
  "Redacción de gacetillas y comunicados de prensa",
  "Gestión y coordinación de entrevistas",
  "Asesoría para responder consultas periodísticas",
  "Seguimiento de publicaciones y reporte mensual",
]
const ESTRATEGIA_INCLUDES = [
  "Diagnóstico de comunicación actual",
  "Definición de posicionamiento y mensajes clave",
  "Plan de comunicación mensual, trimestral o anual",
  "Selección de canales y medios prioritarios",
  "Acompañamiento y ajuste de estrategia",
]
const PASOS = ["Diagnóstico", "Posicionamiento", "Plan", "Canales", "Acompañamiento"]

/* ─── shared ─────────────────────────────────────────────────── */
function IncludesList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const border = dark ? "border-dorado/30" : "border-dorado/25"
  const label  = dark ? "text-hueso/40"    : "text-gris-bordo/50"
  const text   = dark ? "text-hueso/70"    : "text-gris-bordo"
  return (
    <div>
      <p className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-0 ${label}`}>
        Qué incluye
      </p>
      {items.map((item) => (
        <div key={item} className={`border-t ${border} py-4`}>
          <span className={`font-sans text-[13px] leading-relaxed ${text}`}>{item}</span>
        </div>
      ))}
      <div className={`border-t ${border}`} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CAMBIO 1 — HERO: 3 columnas simultáneas
═══════════════════════════════════════════════════════════════ */
const HERO_CARDS = [
  {
    id: "01",
    num: "01",
    name: "Prensa y Comunicación",
    desc: "Gacetillas, entrevistas y relaciones con periodistas para posicionarte como referente.",
  },
  {
    id: "02",
    num: "02",
    name: "Comunicación Estratégica",
    desc: "Planes de comunicación mensuales, trimestrales o anuales según tu etapa.",
  },
  {
    id: "03",
    num: "03",
    name: "Relaciones Públicas",
    desc: "Networking, alianzas e imagen institucional para construir reputación sólida.",
  },
]

function HeroServicios() {
  return (
    <section className="bg-hueso py-[60px] pt-[100px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <motion.p variants={fadeUp} className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4">
            Servicios
          </motion.p>
          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />
          <motion.h1
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo text-[2.5rem] sm:text-[3rem] lg:text-[56px] leading-[1.05] mb-4"
          >
            <span className="block">Tres formas de llevar</span>
            <em className="block italic text-bordo">tu historia a los medios.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-sans text-[15px] text-gris-bordo max-w-[460px] leading-relaxed">
            Cada servicio se adapta a una etapa distinta de tu proyecto. Podés elegir uno o combinarlos.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {HERO_CARDS.map((card) => (
            <motion.div key={card.id} variants={revealCard}>
              <Link
                href={`#${card.id}`}
                className="group block bg-hueso border border-dorado rounded-2xl p-10 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(102,0,31,0.08)]"
              >
                <p className="font-mono text-[10px] text-bordo/40 mb-4">{card.num}</p>
                <p className="font-playfair font-bold text-negro-bordo text-[24px] leading-tight mb-3">
                  {card.name}
                </p>
                <p className="font-sans text-[14px] text-gris-bordo leading-relaxed mb-6">
                  {card.desc}
                </p>
                <span className="inline-flex items-center border border-bordo text-bordo font-sans text-[13px] px-4 py-2 rounded-lg group-hover:bg-bordo group-hover:text-hueso transition-all duration-200">
                  Ver detalle →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CAMBIO 2 — TYPEWRITER para "Redacción"
═══════════════════════════════════════════════════════════════ */
const WORD = "Redacción"

function TypewriterSuffix() {
  const [text, setText]           = useState("")
  const [showCursor, setShow]     = useState(false)
  const [cursorOn, setCursorOn]   = useState(false)
  const [done, setDone]           = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    WORD.split("").forEach((_, i) => {
      timers.push(setTimeout(() => setText(WORD.slice(0, i + 1)), i * 50))
    })

    const afterType = WORD.length * 50

    // show cursor immediately after typing
    timers.push(setTimeout(() => { setShow(true); setCursorOn(true) }, afterType + 50))
    // blink 1
    timers.push(setTimeout(() => setCursorOn(false), afterType + 350))
    timers.push(setTimeout(() => setCursorOn(true),  afterType + 650))
    // blink 2
    timers.push(setTimeout(() => setCursorOn(false), afterType + 950))
    timers.push(setTimeout(() => setCursorOn(true),  afterType + 1250))
    // hide cursor permanently
    timers.push(setTimeout(() => { setShow(false); setDone(true) }, afterType + 1600))

    return () => timers.forEach(clearTimeout)
  }, [])

  if (!text && !done) return null

  return (
    <em className="font-playfair italic text-dorado not-italic" style={{ fontStyle: "italic" }}>
      {" · "}{text}
      {showCursor && (
        <span
          className="inline-block w-[2px] h-[20px] bg-dorado ml-0.5 align-text-bottom"
          style={{ opacity: cursorOn ? 1 : 0, transition: "opacity 0.1s" }}
        />
      )}
    </em>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 2 — PRENSA Y COMUNICACIÓN  (id="01")
═══════════════════════════════════════════════════════════════ */
function ServicioPrensaSection() {
  return (
    <section id="01" className="bg-bordo py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-start">

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-6 relative"
        >
          <span
            className="absolute -top-2 left-0 font-mono leading-none text-hueso select-none pointer-events-none"
            style={{ fontSize: 120, opacity: 0.06 }}
            aria-hidden
          >
            01
          </span>
          <motion.span variants={fadeUp} className="font-mono text-[10px] uppercase tracking-[0.2em] text-hueso/50 relative z-10">
            Servicio principal
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-hueso text-[40px] leading-[1.1] relative z-10">
            Prensa y Comunicación<TypewriterSuffix />
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-[14px] text-hueso/75 leading-[1.8] max-w-[520px] relative z-10">
            Gestión orgánica de presencia en medios para transformar tus hitos, lanzamientos o
            novedades en contenido de valor periodístico. Con más de una década de experiencia
            en el ecosistema de medios de Mendoza, me encargo de que tu mensaje llegue al
            periodista adecuado, en el momento justo y con el enfoque correcto.
          </motion.p>
          <motion.p variants={fadeUp} className="font-sans text-[13px] relative z-10">
            <span className="font-semibold text-hueso">Para quién: </span>
            <span className="text-hueso/60">
              Marcas, profesionales y emprendedores que quieren posicionarse como referentes en su industria.
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          variants={revealCard}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="rounded-2xl p-8 flex flex-col gap-6"
          style={{ background: "rgba(254,252,239,0.06)", border: "1px solid rgba(254,252,239,0.1)" }}
        >
          <IncludesList items={PRENSA_INCLUDES} dark />
          <div className="mt-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dorado mb-3">Caso real</p>
            <div className="rounded-lg p-4" style={{ background: "rgba(254,252,239,0.04)" }}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-hueso/50 mb-2">
                MDZ Online · Colegio Notarial de Mendoza
              </p>
              <p className="font-playfair text-[14px] text-hueso leading-snug">
                "El Colegio Notarial presenta su nueva plataforma digital para tramitar
                documentos sin moverse de casa."
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CAMBIO 3 — ESTRATEGIA: diagrama animado con highlight cíclico
═══════════════════════════════════════════════════════════════ */
function AnimatedSteps() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setActive(p => (p + 1) % PASOS.length), 2000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div
      className="bg-hueso border border-dorado rounded-2xl p-[50px] min-h-[400px] flex flex-col justify-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris-bordo/50 mb-8">
        Proceso de trabajo
      </p>

      <div className="flex items-stretch gap-5">
        {/* Vertical animated line */}
        <div className="relative w-[2px] self-stretch shrink-0">
          <div className="absolute inset-0 bg-dorado/10 rounded-full" />
          <motion.div
            className="absolute top-0 left-0 right-0 bg-bordo rounded-full origin-top"
            animate={{ scaleY: (active + 1) / PASOS.length }}
            transition={{ duration: 1.8, ease: "linear" }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col justify-between flex-1 gap-3">
          {PASOS.map((paso, i) => (
            <motion.div
              key={paso}
              animate={{
                opacity: i === active ? 1 : 0.4,
                x:       i === active ? 6 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`pl-4 py-3 rounded-lg font-sans text-[13px] border-l-2 transition-colors duration-300 ${
                i === active
                  ? "border-l-bordo text-negro-bordo"
                  : "border-l-dorado/20 text-gris-bordo"
              }`}
              style={i === active ? { background: "rgba(102,0,31,0.05)" } : {}}
            >
              {paso}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ServicioEstrategiaSection() {
  return (
    <section id="02" className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-12 lg:gap-16 items-center">

        <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <AnimatedSteps />
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-6 relative"
        >
          <span
            className="absolute -top-2 right-0 font-mono leading-none text-bordo select-none pointer-events-none"
            style={{ fontSize: 120, opacity: 0.04 }}
            aria-hidden
          >
            02
          </span>
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[40px] leading-[1.1] relative z-10">
            Comunicación Estratégica
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-[14px] text-gris-bordo leading-[1.8] max-w-[520px] relative z-10">
            Diseño de planes de comunicación a medida — mensuales, trimestrales o anuales —
            según las necesidades de cada etapa de tu proyecto. Analizamos qué historia contar,
            a quién hablarle y cómo hacerlo, alineando cada acción con tus objetivos de negocio
            o posicionamiento personal.
          </motion.p>
          <motion.div variants={fadeUp} className="relative z-10">
            <IncludesList items={ESTRATEGIA_INCLUDES} />
          </motion.div>
          <motion.p variants={fadeUp} className="font-sans text-[13px] relative z-10">
            <span className="font-semibold text-negro-bordo">Para quién: </span>
            <span className="text-gris-bordo">
              Negocios en crecimiento que necesitan comunicar ese crecimiento de forma ordenada y profesional.
            </span>
          </motion.p>
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 4 — RELACIONES PÚBLICAS  (id="03")
═══════════════════════════════════════════════════════════════ */
function ServicioRRPPSection() {
  return (
    <section id="03" className="bg-hueso py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <span
          className="absolute -top-2 left-6 lg:left-12 font-mono leading-none text-bordo select-none pointer-events-none"
          style={{ fontSize: 120, opacity: 0.04 }}
          aria-hidden
        >
          03
        </span>
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative z-10 max-w-[640px]"
        >
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[40px] leading-[1.1] mb-5">
            Relaciones Públicas
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-[14px] text-gris-bordo leading-[1.8]">
            Gestión de relaciones institucionales y networking para fortalecer la reputación de
            marcas y personas. Actúo como nexo estratégico para generar alianzas, coordinar
            presencia en eventos clave y facilitar el contacto con actores relevantes.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CAMBIO 5 — COMPARACIÓN: "Conversemos →"
═══════════════════════════════════════════════════════════════ */
const COMPARACION = [
  { num: "01", name: "Prensa y Comunicación",    frase: "Quiero salir en los medios.",           duracion: "Campañas puntuales o mensuales", featured: true  },
  { num: "02", name: "Comunicación Estratégica", frase: "Necesito un plan de comunicación.",      duracion: "Trimestral o anual",             featured: false },
  { num: "03", name: "Relaciones Públicas",       frase: "Quiero construir red y reputación.",    duracion: "Acompañamiento continuo",        featured: false },
]

function ComparacionSection() {
  return (
    <section className="bg-hueso-oscuro py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-14"
        >
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[36px] leading-[1.1] mb-3">
            ¿Cuál necesitás?
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-[14px] text-gris-bordo">
            Tres formas distintas de trabajar, según tu etapa y objetivo.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {COMPARACION.map((s) => (
            <motion.div
              key={s.num}
              variants={revealCard}
              className={`bg-hueso rounded-xl p-7 flex flex-col gap-5 relative ${
                s.featured
                  ? "border-t-[3px] border-t-bordo border-x border-b border-dorado/20"
                  : "border border-dorado/15"
              }`}
            >
              {s.featured && (
                <span className="absolute -top-[11px] left-6 font-mono text-[9px] uppercase tracking-[0.15em] bg-bordo text-hueso px-2 py-0.5 rounded-sm">
                  Más solicitado
                </span>
              )}
              <div>
                <p className="font-sans font-semibold text-[16px] text-negro-bordo mb-1">{s.name}</p>
                <p className="font-sans text-[13px] text-gris-bordo italic">{s.frase}</p>
              </div>
              <div className="h-px bg-dorado/20" />
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gris-bordo/50">Duración típica</span>
                <p className="font-sans text-[13px] text-gris-bordo mt-1">{s.duracion}</p>
              </div>
              {/* CAMBIO 5: "Conversemos →" */}
              <Link
                href="/contacto"
                className="mt-auto inline-flex items-center justify-center border border-bordo text-bordo font-sans text-[13px] px-4 py-2.5 rounded-lg hover:bg-bordo hover:text-hueso transition-all duration-200"
              >
                Conversemos →
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT — CAMBIO 6: sin CtaCierreSection
═══════════════════════════════════════════════════════════════ */
export function ServiciosPageSections() {
  return (
    <>
      <HeroServicios />
      <ServicioPrensaSection />
      <ServicioEstrategiaSection />
      <ServicioRRPPSection />
      <TimelineRelacionesPublicas />
      <ComparacionSection />
    </>
  )
}
