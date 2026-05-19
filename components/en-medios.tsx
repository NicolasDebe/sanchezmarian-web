"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { ShiftCard } from "@/components/ui/shift-card"

const EASE = [0.22, 1, 0.36, 1] as const

const FILTROS = ["Todos", "Empresas & Agro", "Marcas Personales", "Instituciones & Eventos"]

const TYPE_COLORS: Record<string, string> = {
  Digital: "text-bordo/60 border-bordo/15",
  Gráfico: "text-bordo-claro/70 border-bordo-claro/20",
  Radio:   "text-gris-bordo/60 border-gris-bordo/20",
  TV:      "text-dorado/80 border-dorado/30",
}

const MEDIOS = [
  {
    medio: "La Nación",
    type: "Gráfico",
    headline: "Cómo construir una marca personal sólida en el mercado actual",
    year: "2024",
    categoria: "Marcas Personales",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    headline: "Las claves para que tu negocio aparezca en los medios que importan",
    year: "2024",
    categoria: "Empresas & Agro",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    headline: "Consultoras mendocinas que transforman la comunicación empresarial",
    year: "2023",
    categoria: "Empresas & Agro",
  },
  {
    medio: "Infobae",
    type: "Digital",
    headline: "Estrategias de prensa para emprendedores y profesionales independientes",
    year: "2024",
    categoria: "Marcas Personales",
  },
  {
    medio: "Radio Nihuil",
    type: "Radio",
    headline: "Comunicación estratégica: cómo hablarle a tu audiencia ideal",
    year: "2023",
    categoria: "Instituciones & Eventos",
  },
  {
    medio: "Diario UNO",
    type: "Digital",
    headline: "El rol de la comunicación en el crecimiento de las PyMEs mendocinas",
    year: "2023",
    categoria: "Empresas & Agro",
  },
]

export function EnMedias() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [activeFilter, setActiveFilter] = useState("Todos")

  const filtered = activeFilter === "Todos"
    ? MEDIOS
    : MEDIOS.filter((m) => m.categoria === activeFilter)

  return (
    <section id="medios" ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/70 mb-4"
            >
              Casos de éxito
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="w-10 h-px bg-dorado mb-5"
            />

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
              className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] leading-[1.15] mb-4"
            >
              <span className="block">Historias que</span>
              <em className="block italic text-bordo-claro">llegaron a destino.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="font-sans text-gris-bordo text-sm leading-relaxed max-w-[440px]"
            >
              El impacto de una buena estrategia se mide en su presencia en los medios.
              Una selección de gestiones de prensa realizadas para marcas, empresas y
              profesionales que confiaron en mi visión.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="shrink-0"
          >
            <Link
              href="/en-medios"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-negro-bordo hover:text-bordo-claro transition-colors group"
            >
              Ver todas las apariciones
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full border transition-all duration-200 ${
                activeFilter === f
                  ? "bg-bordo text-hueso border-bordo"
                  : "text-bordo/50 border-bordo/15 hover:border-bordo/35 hover:text-bordo"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Grid de ShiftCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.medio}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <ShiftCard
                  topContent={
                    <div className="flex items-center justify-between w-full">
                      <p className="font-mono font-bold text-negro-bordo text-sm tracking-wide">
                        {item.medio}
                      </p>
                      <span
                        className={`font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${
                          TYPE_COLORS[item.type] ?? "text-gris-bordo/50 border-gris-bordo/15"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  }
                  topAnimateContent={
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-1 mt-1"
                    >
                      <ExternalLink size={11} className="text-bordo/40" strokeWidth={1.5} />
                      <span className="font-mono text-[9px] text-bordo/40 uppercase tracking-wider">
                        Ver aparición
                      </span>
                    </motion.div>
                  }
                  middleContent={
                    <p className="font-playfair italic text-negro-bordo text-[1.05rem] leading-snug">
                      {item.headline}
                    </p>
                  }
                  bottomContent={
                    <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
                      <span className="font-mono text-[10px] text-gris-bordo/50 tracking-wide">{item.year}</span>
                      <p className="font-sans text-gris-bordo text-xs leading-relaxed">{item.headline}</p>
                    </div>
                  }
                  expandedHeight={170}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}
