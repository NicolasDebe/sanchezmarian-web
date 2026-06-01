"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { fadeUp, fadeUpStagger } from "@/lib/animations"

export function Hero() {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-start"
      style={{
        backgroundImage: "url(/images/hero-marian.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Overlay degradado — oscuro izq donde va el texto, transparente der donde está Marian */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-24">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-1/2"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-hueso/70 mb-6"
          >
            Estratega de comunicación · Mendoza, AR
          </motion.p>

          <h1 className="font-playfair font-bold text-hueso leading-[1.1] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%", rotate: -1 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                Tu historia merece estar
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%", rotate: -1 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              >
                <em className="italic text-dorado">en los medios.</em>
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-hueso/85 leading-relaxed mb-8 max-w-md"
          >
            Conecto tu marca personal o empresarial con el ecosistema de medios
            de Mendoza de forma natural, aportando valor al periodista y
            visibilidad estratégica a tu proyecto.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-bordo text-hueso px-8 py-3.5 rounded font-medium hover:bg-bordo-oscuro active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso"
            >
              Quiero aparecer en medios
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 border border-hueso/60 text-hueso px-8 py-3.5 rounded font-medium hover:border-hueso hover:bg-hueso/10 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso"
            >
              Ver mis servicios
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
