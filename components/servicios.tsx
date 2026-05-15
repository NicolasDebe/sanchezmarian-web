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
    <section id="servicios" ref={ref} className="bg-marino-osc py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-start">

        {/* ── IZQUIERDA — lista interactiva ── */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota mb-6"
          >
            Servicios
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="font-playfair font-bold text-white text-[2rem] sm:text-[2.4rem] leading-[1.15] mb-10"
          >
            <span className="block">Lo que hacemos</span>
            <em className="block text-terracota italic">juntos.</em>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="divide-y divide-white/10"
          >
            {SERVICIOS_DATA.map((s, i) => {
              const isActive = activeIndex === i
              return (
                <div key={s.num}>
                  <button
                    onClick={() => setActiveIndex(i)}
                    className="w-full flex items-center justify-between gap-4 py-5 cursor-pointer group text-left"
                    aria-expanded={isActive}
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-[11px] text-terracota/80 w-6 shrink-0">
                        {s.num}
                      </span>
                      <div>
                        <p
                          className={`font-playfair font-bold text-[1.15rem] transition-colors duration-200 ${
                            isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
                          }`}
                        >
                          {s.name}
                        </p>
                        {!isActive && (
                          <p className="font-sans text-xs text-white/35 mt-0.5 hidden sm:block">
                            {s.short}
                          </p>
                        )}
                      </div>
                    </div>

                    <motion.span
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-terracota" : "text-white/30 group-hover:text-white/60"
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
                        <p className="font-sans text-white/55 text-sm leading-relaxed pb-5 pl-11">
                          {s.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* ── DERECHA — card promo ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.35, ease: EASE }}
          className="lg:sticky lg:top-32"
        >
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-8 flex flex-col gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-terracota">
              ¿Por dónde empezás?
            </span>

            <h3 className="font-playfair font-bold text-white text-[1.5rem] leading-snug">
              Consultá gratis y armamos tu estrategia juntos.
            </h3>

            <p className="font-sans text-white/50 text-sm leading-relaxed">
              Una charla de 30 minutos para entender tu situación y
              ver exactamente cómo puedo ayudarte.
            </p>

            {/* Mini stat */}
            <div className="grid grid-cols-2 gap-3 py-1">
              {[
                { n: "30 min", label: "Consulta gratis" },
                { n: "100%", label: "Sin compromiso" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="font-playfair font-bold text-white text-xl">{item.n}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-white/40 mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-terracota text-white px-5 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 active:scale-[0.98] transition-all"
            >
              Agendá una consulta
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
