"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { HOME_CLIPPINGS, type Clipping } from "@/data/clippings"

const EASE = [0.22, 1, 0.36, 1] as const

function MediaCard({ cliente, medio, formato, alcance, titular, año, link }: Clipping) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="bg-hueso rounded-xl p-5 flex flex-col gap-3 group cursor-pointer transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(102,0,31,0.08)]"
      style={{ borderLeft: "3px solid var(--color-bordo)" }}
    >
      {/* Cliente */}
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bordo">
        {cliente}
      </p>

      {/* Medio + badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-playfair font-bold text-negro-bordo text-[0.9375rem] leading-snug">
          {medio}
        </p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-arena text-gris-bordo">
            {formato}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-bordo/10 text-bordo">
            {alcance}
          </span>
        </div>
      </div>

      {/* Titular */}
      <p className="font-sans text-[0.875rem] text-negro-bordo leading-[1.4] line-clamp-2 flex-1">
        {titular}
      </p>

      {/* Footer: año + ícono */}
      <div className="flex items-end justify-between pt-2 mt-auto">
        <span className="font-mono text-[11px] text-gris-bordo/50">{año}</span>
        <ExternalLink
          size={13}
          strokeWidth={1.5}
          className="text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </motion.a>
  )
}

export function EnMedias() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="medios" ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
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
              <span className="block">Historias que llegaron</span>
              <em className="block italic text-bordo">a los medios.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="font-sans text-gris-bordo text-sm leading-relaxed max-w-[440px]"
            >
              +100 gestiones de prensa realizadas para marcas, empresas y profesionales
              que confiaron en mi visión.
            </motion.p>
          </div>

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
              Ver todos los casos
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* Grid 3×3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOME_CLIPPINGS.map((item, i) => (
            <motion.div
              key={item.id}
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
