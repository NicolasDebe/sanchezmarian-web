"use client"

import { useState } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import {
  fadeUp, fadeLeft, fadeRight, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"

/* ─── helpers ────────────────────────────────────────────────── */
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

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

const RRPP_INCLUDES = [
  "Gestión de relaciones institucionales y con medios",
  "Representación y networking en eventos clave",
  "Coordinación de alianzas estratégicas",
  "Manejo de imagen y reputación pública",
  "Acompañamiento continuo y construcción de vínculos",
]

const PASOS = ["Diagnóstico", "Posicionamiento", "Plan", "Canales", "Acompañamiento"]

const NET_NODES = [
  { x: 300, y: 70,  label: "Periodista" },
  { x: 185, y: 32,  label: "Medio" },
  { x: 75,  y: 78,  label: "Institución" },
  { x: 42,  y: 170, label: "Alianza" },
  { x: 65,  y: 268, label: "Evento" },
  { x: 175, y: 318, label: "Periodista" },
  { x: 305, y: 295, label: "Medio" },
  { x: 358, y: 195, label: "Institución" },
  { x: 322, y: 115, label: "Alianza" },
  { x: 125, y: 58,  label: "Evento" },
  { x: 52,  y: 235, label: "Red local" },
  { x: 268, y: 328, label: "Partner" },
]
const NET_CX = 200
const NET_CY = 185

/* ─── shared components ─────────────────────────────────────── */
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
   BLOQUE 1 — HERO
═══════════════════════════════════════════════════════════════ */
const HERO_CARDS = [
  {
    id: "servicio-01",
    num: "01",
    name: "Prensa y Comunicación",
    bgVar: "var(--color-bordo)",
    colorVar: "var(--color-hueso)",
    border: "none",
  },
  {
    id: "servicio-02",
    num: "02",
    name: "Comunicación Estratégica",
    bgVar: "var(--color-arena)",
    colorVar: "var(--color-negro-bordo)",
    border: "none",
  },
  {
    id: "servicio-03",
    num: "03",
    name: "Relaciones Públicas",
    bgVar: "var(--color-hueso)",
    colorVar: "var(--color-negro-bordo)",
    border: "1px solid var(--color-dorado)",
  },
]

function HeroServicios() {
  return (
    <section className="bg-hueso pt-28 pb-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-center">

        {/* Left 60% */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4"
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />

          <motion.h1
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo text-[2.5rem] sm:text-[3rem] lg:text-[56px] leading-[1.05] mb-6"
          >
            <span className="block">Tres formas de llevar</span>
            <em className="block italic text-bordo">tu historia a los medios.</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-sans text-[15px] text-gris-bordo max-w-[460px] leading-relaxed"
          >
            Cada servicio se adapta a una etapa distinta de tu proyecto. Podés elegir uno o combinarlos.
          </motion.p>
        </motion.div>

        {/* Right 40% — stacked cards */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="relative h-[240px] hidden lg:block"
        >
          {HERO_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              onClick={() => scrollToId(card.id)}
              className="absolute inset-0 rounded-2xl px-7 py-6 flex flex-col justify-between cursor-pointer text-left"
              style={{
                backgroundColor: card.bgVar,
                color: card.colorVar,
                border: card.border,
                zIndex: 30 - i * 10,
              }}
              initial={{ y: i * 16, x: i * 8 }}
              whileHover={{ y: i * 16 - 12, x: i * 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className="font-mono text-[10px] opacity-40">{card.num}</span>
              <span className="font-playfair font-bold text-[20px] leading-tight">{card.name}</span>
            </motion.button>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 2 — PRENSA Y COMUNICACIÓN
═══════════════════════════════════════════════════════════════ */
function ServicioPrensaSection() {
  return (
    <section id="servicio-01" className="bg-bordo py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-start">

        {/* Left */}
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
            Prensa y Comunicación
          </motion.h2>

          <motion.p variants={fadeUp} className="font-sans text-[14px] text-hueso/75 leading-[1.8] max-w-[520px] relative z-10">
            Gestión orgánica de presencia en medios para transformar tus hitos, lanzamientos o
            novedades en contenido de valor periodístico. Con más de una década de experiencia
            en el ecosistema de medios de Mendoza, me encargo de que tu mensaje llegue al
            periodista adecuado, en el momento justo y con el enfoque correcto para garantizar
            una difusión efectiva y real.
          </motion.p>

          <motion.p variants={fadeUp} className="font-sans text-[13px] relative z-10">
            <span className="font-semibold text-hueso">Para quién: </span>
            <span className="text-hueso/60">
              Marcas, profesionales y emprendedores que quieren posicionarse como referentes en su industria.
            </span>
          </motion.p>
        </motion.div>

        {/* Right — card */}
        <motion.div
          variants={revealCard}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="rounded-2xl p-8 flex flex-col gap-6"
          style={{
            background: "rgba(254,252,239,0.06)",
            border: "1px solid rgba(254,252,239,0.1)",
          }}
        >
          <IncludesList items={PRENSA_INCLUDES} dark />

          <div className="mt-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dorado mb-3">
              Caso real
            </p>
            <div
              className="rounded-lg p-4"
              style={{ background: "rgba(254,252,239,0.04)" }}
            >
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
   BLOQUE 3 — COMUNICACIÓN ESTRATÉGICA
═══════════════════════════════════════════════════════════════ */
function ProcesodiagramaEstrategia() {
  return (
    <div className="flex flex-col max-w-[340px]">
      {PASOS.map((paso, i) => (
        <div key={paso} className="flex items-stretch gap-4">
          <div className="flex flex-col items-center w-5 shrink-0">
            <div
              className={`w-[6px] h-[6px] rounded-full mt-[18px] shrink-0 ${
                i === 0 ? "bg-bordo" : "bg-dorado/30"
              }`}
            />
            {i < PASOS.length - 1 && (
              <div className="flex-1 w-px bg-dorado/25 my-1" />
            )}
          </div>
          <div
            className={`flex-1 mb-3 px-3 py-3 rounded-lg font-sans text-[12px] text-negro-bordo ${
              i === 0
                ? "border border-bordo bg-hueso"
                : "border border-dorado/20 bg-hueso"
            }`}
          >
            {i === 0 && (
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-bordo mr-2 align-middle" />
            )}
            {paso}
          </div>
        </div>
      ))}
    </div>
  )
}

function ServicioEstrategiaSection() {
  return (
    <section id="servicio-02" className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-12 lg:gap-16 items-center">

        {/* Left — process diagram */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <ProcesodiagramaEstrategia />
        </motion.div>

        {/* Right — text */}
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
              Negocios en crecimiento que necesitan comunicar ese crecimiento de forma
              ordenada y profesional.
            </span>
          </motion.p>
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 4 — RELACIONES PÚBLICAS
═══════════════════════════════════════════════════════════════ */
const nodeVariants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 0.85, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

const netContainerVariants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

function NetworkDiagram() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="relative w-full">
      <motion.svg
        viewBox="0 0 400 360"
        className="w-full overflow-visible"
        aria-hidden="true"
        variants={netContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {/* Lines */}
        {NET_NODES.map((node, i) => (
          <line
            key={`l${i}`}
            x1={NET_CX} y1={NET_CY}
            x2={node.x} y2={node.y}
            stroke="var(--color-dorado)"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}

        {/* Outer nodes */}
        {NET_NODES.map((node, i) => (
          <motion.circle
            key={`n${i}`}
            cx={node.x}
            cy={node.y}
            r={8}
            fill="var(--color-arena)"
            stroke="var(--color-dorado)"
            strokeWidth="1"
            variants={nodeVariants}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          />
        ))}

        {/* Center node */}
        <circle cx={NET_CX} cy={NET_CY} r={12} fill="var(--color-bordo)" opacity="0.9" />
        <text
          x={NET_CX} y={NET_CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-hueso)"
          fontSize="8"
          fontFamily="var(--font-dm-mono), monospace"
        >
          M
        </text>
      </motion.svg>

      {active !== null && (
        <div
          className="absolute pointer-events-none font-mono text-[9px] text-negro-bordo bg-hueso border border-dorado/30 px-2 py-1 rounded-md whitespace-nowrap z-10"
          style={{
            left:      `${(NET_NODES[active].x / 400) * 100}%`,
            top:       `${(NET_NODES[active].y / 360) * 100}%`,
            transform: "translate(-50%, -170%)",
          }}
        >
          {NET_NODES[active].label}
        </div>
      )}
    </div>
  )
}

function ServicioRRPPSection() {
  return (
    <section id="servicio-03" className="bg-hueso py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-start">

        {/* Left — text */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-6 relative"
        >
          <span
            className="absolute -top-2 left-0 font-mono leading-none text-bordo select-none pointer-events-none"
            style={{ fontSize: 120, opacity: 0.04 }}
            aria-hidden
          >
            03
          </span>

          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[40px] leading-[1.1] relative z-10">
            Relaciones Públicas
          </motion.h2>

          <motion.p variants={fadeUp} className="font-sans text-[14px] text-gris-bordo leading-[1.8] max-w-[520px] relative z-10">
            Gestión de relaciones institucionales y networking para fortalecer la reputación de
            marcas y personas. Actúo como nexo estratégico para generar alianzas, coordinar
            presencia en eventos clave y facilitar el contacto con actores relevantes.
          </motion.p>

          <motion.p variants={fadeUp} className="font-sans text-[13px] relative z-10">
            <span className="font-semibold text-negro-bordo">Para quién: </span>
            <span className="text-gris-bordo">
              Marcas y personas que buscan construir confianza y visibilidad sostenida en el tiempo.
            </span>
          </motion.p>
        </motion.div>

        {/* Right — network + includes */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-8"
        >
          <NetworkDiagram />
          <IncludesList items={RRPP_INCLUDES} />
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 5 — COMPARACIÓN RÁPIDA
═══════════════════════════════════════════════════════════════ */
const COMPARACION = [
  {
    num: "01",
    name: "Prensa y Comunicación",
    frase: "Quiero salir en los medios.",
    duracion: "Campañas puntuales o mensuales",
    featured: true,
  },
  {
    num: "02",
    name: "Comunicación Estratégica",
    frase: "Necesito un plan de comunicación.",
    duracion: "Trimestral o anual",
    featured: false,
  },
  {
    num: "03",
    name: "Relaciones Públicas",
    frase: "Quiero construir red y reputación.",
    duracion: "Acompañamiento continuo",
    featured: false,
  },
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
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gris-bordo/50">
                  Duración típica
                </span>
                <p className="font-sans text-[13px] text-gris-bordo mt-1">{s.duracion}</p>
              </div>

              <Link
                href="/contacto"
                className="mt-auto inline-flex items-center justify-center border border-bordo text-bordo font-sans text-[13px] px-4 py-2.5 rounded-lg hover:bg-bordo hover:text-hueso transition-all duration-200"
              >
                Consultar →
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 6 — CTA CIERRE
═══════════════════════════════════════════════════════════════ */
function CtaCierreSection() {
  return (
    <section className="bg-bordo py-20 lg:py-24">
      <motion.div
        variants={fadeUpStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center gap-8"
      >
        <motion.h2
          variants={fadeUp}
          className="font-playfair font-bold text-hueso text-[2.5rem] sm:text-[44px] leading-[1.1] max-w-2xl"
        >
          ¿Querés aparecer en los medios?
        </motion.h2>

        <motion.div variants={fadeUp}>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-hueso text-bordo font-sans text-[15px] font-semibold px-8 py-4 rounded-full hover:bg-arena active:scale-[0.98] transition-all"
          >
            Conversemos →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
export function ServiciosPageSections() {
  return (
    <>
      <HeroServicios />
      <ServicioPrensaSection />
      <ServicioEstrategiaSection />
      <ServicioRRPPSection />
      <ComparacionSection />
      <CtaCierreSection />
    </>
  )
}
