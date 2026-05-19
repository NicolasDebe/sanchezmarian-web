"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

// TODO: reemplazar por logo real cuando Marian lo envíe
const CLIENTES = [
  {
    name: "Acutis",
    label: "ACUTIS",
    fontClass: "font-sans font-bold text-lg tracking-[0.12em]",
  },
  {
    name: "Grupo Presidente",
    label: "Grupo Presidente",
    fontClass: "font-playfair font-bold italic text-[1.15rem]",
  },
  {
    name: "Bolsa de Comercio",
    label: "BOLSA DE COMERCIO",
    fontClass: "font-sans font-semibold text-[0.65rem] tracking-[0.22em]",
  },
  {
    name: "QuienVino",
    label: "QuienVino",
    fontClass: "font-sans font-bold text-xl",
  },
  {
    name: "Agrocosecha",
    label: "AGROCOSECHA",
    fontClass: "font-mono text-sm tracking-[0.18em]",
  },
]

export function Clientes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="bg-hueso py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16 mb-14">
          <div className="flex flex-col gap-3">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/70"
            >
              Clientes
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
              className="font-playfair font-bold text-negro-bordo text-[1.75rem] sm:text-[2.25rem] leading-[1.15]"
            >
              Marcas que <em className="italic text-bordo-claro">confiaron</em> en Marian.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-sans text-gris-bordo/60 text-sm leading-relaxed max-w-[300px] pb-1"
          >
            100+ apariciones en medios nacionales y provinciales.
          </motion.p>
        </div>

        {/* Logos — texto estilizado hasta tener los logos reales */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
          className="flex flex-wrap gap-x-12 gap-y-8 items-center"
        >
          {CLIENTES.map((cliente, i) => (
            <motion.div
              key={cliente.name}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.38 + i * 0.09, ease: EASE }}
            >
              {/* TODO: reemplazar por logo real cuando Marian lo envíe */}
              <span className={`${cliente.fontClass} text-negro-bordo/35 select-none`}>
                {cliente.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
