"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import {
  fadeUp, fadeLeft, fadeRight,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 1 — HERO EDITORIAL
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

function HeroEditorial() {
  return (
    <section style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/NAC_4208.jpg"
        alt="Marian Sánchez en su espacio de trabajo"
        className="max-h-[70vh] sm:max-h-[90vh]"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />

      {/* OVERLAY — solo en la franja inferior donde está el texto */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* TEXTO — abajo sobre el overlay */}
      <div
        className="pt-5 sm:pt-0 px-5 sm:px-[clamp(20px,5vw,64px)] pb-8 sm:pb-[clamp(32px,6vh,64px)]"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          <motion.p
            variants={itemVariants}
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "rgba(254,252,239,0.65)",
              marginBottom: "14px",
            }}
          >
            Sobre mí
          </motion.p>

          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#FEFCEF",
              fontWeight: 700,
              margin: 0,
            }}
          >
            <span style={{ display: "block", fontSize: "clamp(1.3rem, 3vw, 2.2rem)", fontWeight: 600, opacity: 0.88 }}>
              Mariana Sánchez,
            </span>
            <em style={{ display: "block", fontSize: "clamp(2rem, 5vw, 4rem)", fontStyle: "italic", lineHeight: 1.0 }}>
              estratega de comunicación.
            </em>
          </motion.h1>

        </motion.div>
      </div>

    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 2 — MANIFIESTO
═══════════════════════════════════════════════════════════════ */
const FRASES = [
  <>
    Conecto tu marca con el ecosistema de medios de forma natural, aportando{" "}
    <em className="italic text-bordo">valor al periodista</em> y visibilidad estratégica a tu proyecto.
  </>,
  <>
    Mi enfoque no se limita a la difusión masiva; se basa en el{" "}
    <em className="italic text-bordo">vínculo real.</em>
  </>,
  <>
    Cada marca tiene{" "}
    <em className="italic text-bordo">un ritmo, un tono y un objetivo diferente.</em>
  </>,
]

function Manifiesto() {
  return (
    <section className="bg-hueso py-[160px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex flex-col gap-12">
          {FRASES.map((frase, i) => (
            <motion.p
              key={i}
              className="font-playfair font-bold text-negro-bordo text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.3]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {frase}
            </motion.p>
          ))}
        </div>

        <motion.p
          className="font-mono text-[11px] text-gris-bordo mt-10 text-right"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: FRASES.length * 0.2 + 0.3 }}
        >
          — Marian Sánchez
        </motion.p>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 3 — TRAYECTORIA
═══════════════════════════════════════════════════════════════ */
const HITOS = [
  { year: "2016", desc: "Primeros pasos en comunicación y medios en Mendoza" },
  { year: "2019", desc: "Fundación de GB Consulting como consultora independiente" },
  { year: "2023", desc: "100+ apariciones en medios gestionadas" },
  { year: "2026", desc: "Consolidación como estratega con red nacional e internacional" },
]

const TRAY_LINE_DUR = 1.5

function Trayectoria() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section className="bg-hueso-oscuro py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4">
            Trayectoria
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[40px] leading-[1.1]">
            Una década construyendo{" "}
            <em className="italic text-bordo">vínculos.</em>
          </motion.h2>
        </motion.div>

        {/* ─── DESKTOP: horizontal ─── */}
        <div ref={ref} className="hidden md:block">

          {/* Años */}
          <div className="grid grid-cols-4 mb-5">
            {HITOS.map((h, i) => (
              <motion.p
                key={h.year}
                className="text-center font-mono text-[12px] text-bordo"
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ duration: 0.4, delay: inView ? i * 0.3 + 0.3 : 0 }}
              >
                {h.year}
              </motion.p>
            ))}
          </div>

          {/* Línea + puntos */}
          <div className="relative py-[5px] mb-5">
            {/* Track */}
            <div
              className="absolute left-0 right-0 h-px bg-dorado/30"
              style={{ top: "calc(50% - 0.5px)" }}
            />
            {/* Fill animado */}
            <motion.div
              className="absolute left-0 right-0 h-px bg-dorado/60 origin-left"
              style={{ top: "calc(50% - 0.5px)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: inView ? 1 : 0 }}
              transition={{ duration: TRAY_LINE_DUR, ease: "easeOut" }}
            />
            {/* Puntos */}
            <div className="grid grid-cols-4 relative z-10">
              {HITOS.map((h, i) => (
                <div key={h.year} className="flex justify-center">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-bordo"
                    initial={{ scale: 0 }}
                    animate={{ scale: inView ? 1 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: inView ? ((i + 1) / HITOS.length) * TRAY_LINE_DUR : 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Descripciones */}
          <div className="grid grid-cols-4 gap-4">
            {HITOS.map((h, i) => (
              <motion.p
                key={h.year}
                className="text-center font-sans text-[13px] text-gris-bordo leading-relaxed max-w-[180px] mx-auto"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 8 }}
                transition={{ duration: 0.4, delay: inView ? i * 0.3 + 0.6 : 0 }}
              >
                {h.desc}
              </motion.p>
            ))}
          </div>

        </div>

        {/* ─── MOBILE: vertical ─── */}
        <div className="md:hidden relative pl-8">
          {/* Track */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-dorado/30" />
          {/* Fill animado */}
          <motion.div
            className="absolute left-0 top-0 w-px bg-dorado/60 origin-top"
            style={{ height: "100%" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          <div className="flex flex-col gap-10 relative z-10">
            {HITOS.map((h, i) => (
              <motion.div
                key={h.year}
                className="relative"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
              >
                {/* Punto sobre la línea */}
                <div className="absolute -left-[35px] top-[3px] w-2 h-2 rounded-full bg-bordo" />
                <p className="font-mono text-[12px] text-bordo mb-1">{h.year}</p>
                <p className="font-sans text-[13px] text-gris-bordo leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 4 — DIFERENCIAL (zigzag)
═══════════════════════════════════════════════════════════════ */
const DIFERENCIAL = [
  {
    num: "01",
    frase: "Relaciones, no contactos.",
    body: "Mis contactos no son números en una base de datos. Son vínculos genuinos construidos durante más de una década en los medios de Mendoza.",
  },
  {
    num: "02",
    frase: "Estrategia antes que acción.",
    body: "Antes de hablar con un periodista, trabajamos juntos para definir qué historia contar y a quién. El mensaje bien diseñado multiplica los resultados.",
  },
  {
    num: "03",
    frase: "Impacto que se mide.",
    body: "Cada aparición en medios queda registrada con análisis de impacto. No solo verás dónde saliste — analizaremos los resultados y definiremos las próximas etapas juntos.",
  },
]

function DiferencialZigzag() {
  return (
    <section className="bg-hueso py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col">

        {DIFERENCIAL.map((item, i) => {
          const visualLeft = i % 2 === 1

          const Visual = (
            <div className="lg:w-[45%] flex items-center justify-center py-12 lg:py-0 shrink-0">
              <div className="relative flex items-center justify-center w-full max-w-[320px] mx-auto" style={{ aspectRatio: "1" }}>
                <span
                  className="absolute font-playfair font-bold text-bordo select-none pointer-events-none"
                  style={{ fontSize: 200, opacity: 0.04, lineHeight: 1 }}
                  aria-hidden
                >
                  {item.num}
                </span>
                <p className="relative font-playfair italic text-[24px] text-bordo text-center leading-snug px-6">
                  "{item.frase}"
                </p>
              </div>
            </div>
          )

          const Text = (
            <motion.div
              variants={visualLeft ? fadeRight : fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:w-[55%] flex flex-col gap-4 py-4"
            >
              <h3 className="font-sans font-semibold text-[18px] text-negro-bordo leading-snug">
                {item.frase}
              </h3>
              <p className="font-sans text-[14px] text-gris-bordo leading-relaxed max-w-[480px]">
                {item.body}
              </p>
            </motion.div>
          )

          return (
            <div key={item.num}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
                {visualLeft ? <>{Visual}{Text}</> : <>{Text}{Visual}</>}
              </div>

              {i < DIFERENCIAL.length - 1 && (
                <div className="flex justify-center my-10">
                  <div className="w-[60px] h-px bg-dorado/20" />
                </div>
              )}
            </div>
          )
        })}

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BLOQUE 5 — CTA CIERRE
═══════════════════════════════════════════════════════════════ */
function CtaCierre() {
  return (
    <section className="bg-bordo py-[100px]">
      <motion.div
        variants={fadeUpStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center gap-6"
      >
        <motion.h2
          variants={fadeUp}
          className="font-playfair font-bold text-hueso text-[3rem] sm:text-[52px] leading-[1.05]"
        >
          ¿Trabajamos juntos?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="font-sans text-[14px]"
          style={{ color: "rgba(254,252,239,0.6)" }}
        >
          Conversemos sobre tu proyecto.
        </motion.p>
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
export function SobreMarianSections() {
  return (
    <>
      <HeroEditorial />
      <Manifiesto />
      <Trayectoria />
      <DiferencialZigzag />
      <CtaCierre />
    </>
  )
}
