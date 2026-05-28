"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"

const RESULTADOS = [
  {
    num: "01",
    resultado: "Tu historia en los medios que importan.",
    servicio: "Prensa y Comunicación",
  },
  {
    num: "02",
    resultado: "Una estrategia alineada a cada etapa de tu proyecto.",
    servicio: "Comunicación Estratégica",
  },
  {
    num: "03",
    resultado: "Reputación construida sobre vínculos reales.",
    servicio: "Relaciones Públicas",
  },
]

export function Servicios() {
  return (
    <section id="servicios" className="bg-hueso py-[140px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-[80px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4"
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo text-[52px] leading-[1.0] mb-6"
          >
            <span className="block">Lo que lográs</span>
            <em className="block italic text-bordo">trabajando juntos.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-[14px] text-gris-bordo max-w-[420px] leading-relaxed"
          >
            No vendés servicios de comunicación. Vendés resultados: visibilidad,
            confianza y presencia en los medios que importan.
          </motion.p>
        </motion.div>

        {/* Grid de resultados */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-3"
        >
          {RESULTADOS.map((r) => (
            <motion.div
              key={r.num}
              variants={fadeUp}
              className="group pt-8 lg:pr-12 cursor-default"
            >
              <div className="w-full h-px bg-dorado/20 mb-8" />

              <span className="block font-mono text-[10px] text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                {r.num}
              </span>

              <p className="font-playfair font-bold text-negro-bordo text-[28px] leading-[1.1] transition-transform duration-300 ease-out group-hover:-translate-y-1">
                {r.resultado}
              </p>

              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-gris-bordo/50 mt-4">
                {r.servicio}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Link centrado */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/servicios"
            className="font-sans text-[14px] text-bordo relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-bordo after:transition-all after:duration-300 hover:after:w-full"
          >
            Ver en detalle cómo trabajamos →
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
