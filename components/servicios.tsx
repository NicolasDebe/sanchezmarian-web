"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const EASE = [0.22, 1, 0.36, 1] as const

const SERVICIOS_DATA = [
  {
    num: "01",
    name: "Prensa y medios",
    short: "Aparecé en los medios que importan.",
    description:
      "Gestiono el vínculo con periodistas y medios para conseguir notas, entrevistas y apariciones que posicionan tu marca o tu nombre. Trabajo con medios locales, provinciales y nacionales.",
  },
  {
    num: "02",
    name: "Copywriting",
    short: "Textos que comunican quién sos.",
    description:
      "Redacto textos para web, redes, newsletters y materiales de prensa. Cada palabra está pensada para tu audiencia y para transmitir tu propuesta de valor con claridad.",
  },
  {
    num: "03",
    name: "Asesoría estratégica",
    short: "Tu estrategia de comunicación, desde cero.",
    description:
      "Diseñamos juntos el plan de comunicación de tu marca o proyecto. Desde la identidad narrativa hasta los canales y mensajes clave — todo alineado a tus objetivos reales.",
  },
  {
    num: "04",
    name: "Social Media",
    short: "Presencia coherente que genera autoridad.",
    description:
      "Gestión y estrategia de redes sociales con foco en posicionamiento y comunidad. Contenido que refuerza tu comunicación en medios y construye tu autoridad online.",
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
              Consultá gratis y armamos tu estrategia juntos.
            </h3>

            <p className="font-sans text-hueso/50 text-sm leading-relaxed">
              Una charla de 30 minutos para entender tu situación y
              ver exactamente cómo puedo ayudarte.
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-3 py-1">
              {[
                { n: "30 min", label: "Consulta gratis" },
                { n: "100%", label: "Sin compromiso" },
              ].map((item) => (
                <div key={item.label} className="bg-hueso/6 border border-hueso/8 rounded-xl px-4 py-3">
                  <p className="font-playfair font-bold text-hueso text-xl">{item.n}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-hueso/35 mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Dorado separator */}
            <div className="h-px bg-dorado/20" />

            <Link
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-hueso text-bordo px-5 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-arena active:scale-[0.98] transition-all"
            >
              Agendá una consulta
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
