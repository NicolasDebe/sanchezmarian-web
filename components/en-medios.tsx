"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"

/*
 * Cult-UI review:
 * - ShiftCard: expand/contract con altura fija — incompatible con cards estáticas + hover lift.
 * - MinimalCard: neutral-50/100 hardcodeados — incompatible con paleta bordo.
 * Resultado: card custom con motion/react whileHover para y-translate,
 *   CSS transition para box-shadow en --bordo rgba(102,0,31,0.08).
 */

const EASE = [0.22, 1, 0.36, 1] as const

const MEDIOS = [
  {
    medio: "La Nación",
    type: "Gráfico",
    headline: "Cómo construir una marca personal sólida en el mercado actual",
    year: "2024",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    headline: "Las claves para que tu negocio aparezca en los medios que importan",
    year: "2024",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    headline: "Consultoras mendocinas que transforman la comunicación empresarial",
    year: "2023",
  },
  {
    medio: "Infobae",
    type: "Digital",
    headline: "Estrategias de prensa para emprendedores y profesionales independientes",
    year: "2024",
  },
  {
    medio: "Radio Nihuil",
    type: "Radio",
    headline: "Comunicación estratégica: cómo hablarle a tu audiencia ideal",
    year: "2023",
  },
  {
    medio: "Diario UNO",
    type: "Digital",
    headline: "El rol de la comunicación en el crecimiento de las PyMEs mendocinas",
    year: "2023",
  },
]

interface MediaItem {
  medio: string
  type: string
  headline: string
  year: string
}

function MediaCard({ medio, type, headline, year }: MediaItem) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="bg-hueso rounded-xl p-5 flex flex-col gap-3 group cursor-default transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(102,0,31,0.08)]"
      style={{ borderLeft: "3px solid var(--color-bordo)" }}
    >
      {/* Medio + badge tipo */}
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bordo">
          {medio}
        </p>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-arena text-gris-bordo shrink-0">
          {type}
        </span>
      </div>

      {/* Titular */}
      <p className="font-playfair text-[1.0625rem] text-negro-bordo leading-[1.35] line-clamp-2 flex-1">
        {headline}
      </p>

      {/* Footer: año + ícono */}
      <div className="flex items-end justify-between pt-2 mt-auto">
        <span className="font-mono text-[11px] text-gris-bordo/50">
          {year}
        </span>
        <ExternalLink
          size={13}
          strokeWidth={1.5}
          className="text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </motion.article>
  )
}

export function EnMedias() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="medios" ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header: título izquierda, link derecha */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">

          {/* Izquierda */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo mb-4"
            >
              Casos de éxito
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
              className="w-10 h-px bg-dorado mb-5"
            />

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
              className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.1] mb-4"
            >
              <span className="block">Historias que</span>
              <em className="block italic text-bordo">llegaron a destino.</em>
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

          {/* Derecha */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="shrink-0 pb-0.5"
          >
            <Link
              href="/casos-de-exito"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-bordo group"
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

        {/* Grid 3×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDIOS.map((item, i) => (
            <motion.div
              key={item.medio}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.38 + i * 0.07, ease: EASE }}
            >
              <MediaCard {...item} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
