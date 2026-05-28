"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

const PHASES = [
  {
    num: "01",
    title: "Diagnóstico",
    desc: "Identifico los actores clave de tu ecosistema y qué historia necesita ser contada.",
  },
  {
    num: "02",
    title: "Primer vínculo",
    desc: "Genero el primer contacto con el periodista o medio indicado de forma orgánica.",
  },
  {
    num: "03",
    title: "Relación sostenida",
    desc: "Construyo una relación auténtica basada en aportar valor real al periodista.",
  },
  {
    num: "04",
    title: "Multiplicación",
    desc: "Otras historias, otros medios. La red crece a partir del vínculo inicial.",
  },
  {
    num: "05",
    title: "Posicionamiento",
    desc: "Tu marca es sinónimo de tu propósito. Las conexiones trabajan para ti.",
  },
]

const RRPP_INCLUDES = [
  "Gestión de relaciones institucionales y con medios",
  "Representación y networking en eventos clave",
  "Coordinación de alianzas estratégicas",
  "Manejo de imagen y reputación pública",
  "Acompañamiento continuo y construcción de vínculos",
]

const LINE_DUR  = 1.5  // horizontal line animation duration (seconds)
const M_LINE_DUR = 2.5 // vertical mobile line duration

export function TimelineRelacionesPublicas() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px 0px" })

  return (
    <div ref={ref} className="bg-hueso-oscuro py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-[60px]">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4">
            El proceso
          </p>
          <h3 className="font-playfair font-bold text-negro-bordo text-[42px] leading-[1.1]">
            Cómo construyo relaciones que perduran.
          </h3>
          <div className="w-full h-px bg-dorado/10 mt-8" />
        </div>

        {/* ══════════════════════════════════════════
            DESKTOP — horizontal timeline
        ══════════════════════════════════════════ */}
        <div className="hidden md:block relative">

          {/* Track */}
          <div className="absolute bottom-[18px] left-0 right-0 h-px bg-dorado/10" />

          {/* Animated fill — scaleX origin-left */}
          <motion.div
            className="absolute bottom-[18px] left-0 right-0 h-px bg-dorado/50 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: LINE_DUR, ease: "easeOut" }}
          />

          {/* Nodes grid */}
          <div className="grid grid-cols-5">
            {PHASES.map((phase, i) => {
              const nodeDelay = ((i + 1) / PHASES.length) * LINE_DUR

              return (
                <div
                  key={phase.num}
                  className="group flex flex-col items-center"
                >
                  {/* Text content */}
                  <motion.div
                    className="text-center px-3 mb-3 flex flex-col gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 10 }}
                    transition={{
                      duration: 0.4,
                      delay: nodeDelay + 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <p className="font-mono text-[10px] text-bordo/60 mb-1">{phase.num}</p>
                    <p className="font-sans font-medium text-[14px] text-negro-bordo leading-snug group-hover:-translate-y-1 transition-transform duration-200">
                      {phase.title}
                    </p>
                    <p className="font-sans text-[13px] text-gris-bordo leading-relaxed">
                      {phase.desc}
                    </p>
                  </motion.div>

                  {/* 6px connector */}
                  <div className="w-px h-6 bg-dorado/25 shrink-0" />

                  {/* Circle with number */}
                  <motion.div
                    className="w-9 h-9 rounded-full border-2 border-bordo bg-hueso-oscuro flex items-center justify-center shrink-0 z-10 group-hover:-translate-y-1 transition-transform duration-200"
                    initial={{ scale: 0 }}
                    animate={{ scale: inView ? 1 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: nodeDelay,
                    }}
                  >
                    <span className="font-mono text-[9px] text-bordo leading-none">{phase.num}</span>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MOBILE — vertical alternating timeline
        ══════════════════════════════════════════ */}
        <div className="md:hidden relative py-4">

          {/* Track */}
          <div className="absolute inset-0 flex justify-center pointer-events-none">
            <div className="w-px bg-dorado/10 h-full" />
          </div>

          {/* Animated fill */}
          <div className="absolute inset-0 flex justify-center pointer-events-none">
            <motion.div
              className="w-px bg-dorado/50 h-full origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: inView ? 1 : 0 }}
              transition={{ duration: M_LINE_DUR, ease: "easeOut" }}
            />
          </div>

          {/* Nodes */}
          <div className="flex flex-col gap-10 relative z-10">
            {PHASES.map((phase, i) => {
              const nodeDelay = ((i + 1) / PHASES.length) * M_LINE_DUR
              const isRight   = i % 2 === 0

              return (
                <div key={phase.num} className="flex items-center">

                  {/* Left side */}
                  <div className="flex-1 flex justify-end pr-5 min-h-[56px]">
                    {!isRight && (
                      <motion.div
                        className="text-right max-w-[160px]"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 8 }}
                        transition={{ duration: 0.4, delay: nodeDelay + 0.15 }}
                      >
                        <p className="font-sans font-medium text-[14px] text-negro-bordo mb-1">
                          {phase.title}
                        </p>
                        <p className="font-sans text-[12px] text-gris-bordo leading-relaxed">
                          {phase.desc}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Circle */}
                  <motion.div
                    className="w-9 h-9 rounded-full border-2 border-bordo bg-hueso-oscuro flex items-center justify-center shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: inView ? 1 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: nodeDelay,
                    }}
                  >
                    <span className="font-mono text-[9px] text-bordo leading-none">{phase.num}</span>
                  </motion.div>

                  {/* Right side */}
                  <div className="flex-1 pl-5 min-h-[56px]">
                    {isRight && (
                      <motion.div
                        className="max-w-[160px]"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -8 }}
                        transition={{ duration: 0.4, delay: nodeDelay + 0.15 }}
                      >
                        <p className="font-sans font-medium text-[14px] text-negro-bordo mb-1">
                          {phase.title}
                        </p>
                        <p className="font-sans text-[12px] text-gris-bordo leading-relaxed">
                          {phase.desc}
                        </p>
                      </motion.div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* ── Para quién + Qué incluye ── */}
        <div className="mt-16 pt-12 border-t border-dorado/15 grid grid-cols-1 lg:grid-cols-2 gap-10">

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris-bordo/50 mb-3">
              Para quién
            </p>
            <p className="font-sans text-[14px] text-gris-bordo leading-relaxed">
              Marcas y personas que buscan construir confianza y visibilidad sostenida en el tiempo.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris-bordo/50 mb-3">
              Qué incluye
            </p>
            <ul className="flex flex-col gap-3">
              {RRPP_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-dorado font-bold text-[18px] leading-none mt-[-1px] shrink-0">·</span>
                  <span className="font-sans text-[14px] text-gris-bordo leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  )
}
