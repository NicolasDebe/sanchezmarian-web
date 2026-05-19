"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const EASE = [0.22, 1, 0.36, 1] as const

const SERVICIOS_DATA = [
  {
    num: "01",
    name: "Prensa y Comunicación",
    short: "Tu historia en los medios que importan.",
    description:
      "Gestión orgánica de presencia en medios para transformar tus hitos, lanzamientos o novedades en contenido de valor periodístico. Con más de una década de experiencia en el ecosistema de medios de Mendoza, me encargo de que tu mensaje llegue al periodista adecuado, en el momento justo y con el enfoque correcto para garantizar una difusión efectiva y real.",
  },
  {
    num: "02",
    name: "Comunicación Estratégica",
    short: "Tu plan de comunicación, desde cero.",
    description:
      "Diseño de planes de comunicación a medida — mensuales, trimestrales o anuales — según las necesidades de cada etapa de tu proyecto. Analizamos qué historia contar, a quién hablarle y cómo hacerlo, alineando cada acción con tus objetivos de negocio o posicionamiento personal.",
  },
  {
    num: "03",
    name: "Relaciones Públicas",
    short: "Reputación y vínculos que perduran.",
    description:
      "Gestión de relaciones institucionales y networking para fortalecer la reputación de marcas y personas. Actúo como nexo estratégico para generar alianzas, coordinar presencia en eventos clave y facilitar el contacto con actores relevantes. Un trabajo constante que construye confianza y visibilidad sostenida en el tiempo.",
  },
]

export function Servicios() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="servicios" ref={ref} className="bg-hueso py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start">

        {/* ── IZQUIERDA — acordeón ── */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/70 mb-4"
          >
            Servicios
          </motion.p>

          {/* Dorado line */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="w-10 h-px bg-dorado mb-7"
          />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
            className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.4rem] leading-[1.15] mb-10"
          >
            <span className="block">Lo que hacemos</span>
            <em className="block text-bordo-claro italic">juntos.</em>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {SERVICIOS_DATA.map((s, i) => {
              const isActive = activeIndex === i
              return (
                <div key={s.num} className={i > 0 ? "border-t border-dorado/20" : ""}>
                  <button
                    onClick={() => setActiveIndex(i)}
                    className="w-full flex items-center justify-between gap-4 py-5 cursor-pointer group text-left"
                    aria-expanded={isActive}
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-[11px] text-bordo/50 w-6 shrink-0">
                        {s.num}
                      </span>
                      <div>
                        <p
                          className={`font-playfair font-bold text-[1.15rem] transition-colors duration-200 ${
                            isActive ? "text-bordo" : "text-gris-bordo/70 group-hover:text-negro-bordo"
                          }`}
                        >
                          {s.name}
                        </p>
                        {!isActive && (
                          <p className="font-sans text-xs text-gris-bordo/45 mt-0.5 hidden sm:block">
                            {s.short}
                          </p>
                        )}
                      </div>
                    </div>

                    <motion.span
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-bordo" : "text-gris-bordo/30 group-hover:text-gris-bordo/60"
                      }`}
                    >
                      <Plus size={18} strokeWidth={1.5} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="font-sans text-gris-bordo text-sm leading-relaxed pb-6 pl-11">
                          {s.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
            {/* Bottom dorado line */}
            <div className="border-t border-dorado/20" />
          </motion.div>
        </div>

        {/* ── DERECHA — card promo ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.35, ease: EASE }}
          className="lg:sticky lg:top-32"
        >
          <div className="bg-bordo rounded-[1.5rem] p-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-dorado/60">
              ¿Por dónde empezás?
            </span>

            <h3 className="font-playfair font-bold text-hueso text-[1.5rem] leading-snug">
              ¿Querés aparecer en los medios?
            </h3>

            <p className="font-sans text-hueso/50 text-sm leading-relaxed">
              Conversemos sobre tu proyecto.
            </p>

            {/* Dorado separator */}
            <div className="h-px bg-dorado/20" />

            <Link
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-hueso text-bordo px-5 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-arena active:scale-[0.98] transition-all"
            >
              Conversemos
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
