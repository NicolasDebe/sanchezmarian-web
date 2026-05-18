"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TextureCardStyled } from "@/components/ui/texture-card"

const EASE = [0.22, 1, 0.36, 1] as const

const TAGS = [
  "Comunicación estratégica",
  "Prensa y medios",
  "Marca personal",
  "Mendoza, Argentina",
  "Copywriting",
  "Social Media",
]

export function Bio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="bio" ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* ── IZQUIERDA — foto con TextureCard ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-[380px]">
            <TextureCardStyled className="p-2">
              {/* Foto placeholder */}
              <div className="w-full aspect-[3/4] rounded-[20px] overflow-hidden bg-arena">
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-bordo/20" />
                  <div className="w-28 h-2 rounded-full bg-bordo/15" />
                  <p className="font-mono text-[10px] text-bordo/40 uppercase tracking-widest mt-2">
                    Foto · Marian
                  </p>
                </div>
              </div>
            </TextureCardStyled>

            {/* Badge flotante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.4, ease: EASE }}
              className="absolute -bottom-5 -right-4 lg:-right-8 bg-bordo text-hueso px-5 py-4 rounded-2xl shadow-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-hueso/45 mb-0.5">Desde</p>
              <p className="font-playfair font-bold text-2xl leading-none">2016</p>
              <p className="font-sans text-xs text-hueso/60 mt-0.5">en comunicación</p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── DERECHA — texto ── */}
        <div className="flex flex-col gap-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/70"
          >
            Sobre Marian
          </motion.p>

          {/* Dorado line */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className="w-10 h-px bg-dorado"
          />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] leading-[1.15]"
          >
            <span className="block">Mariana Sánchez,</span>
            <em className="block italic text-bordo-claro">consultora de comunicación.</em>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.34 }}
            className="flex flex-col gap-4 font-sans text-gris-bordo text-base leading-relaxed max-w-[480px]"
          >
            <p>
              Soy consultora de comunicación y prensa, y dueña de GB Consulting en Mendoza.
              Trabajo con marcas, empresas y profesionales que quieren construir una
              presencia real en los medios que importan.
            </p>
            <p>
              Mi diferencial es simple: tengo relaciones genuinas con periodistas y sé
              exactamente qué historia contar para que la tuya sea la que se publique.
              Más de 50 apariciones en medios avalan ese trabajo.
            </p>
          </motion.div>

          {/* Tags — 1px border bordo */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.46 }}
            className="flex flex-wrap gap-2"
          >
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="font-mono text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-bordo/20 text-bordo/60"
              >
                {tag}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.54 }}
          >
            <Link
              href="/sobre-marian"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-negro-bordo hover:text-bordo-claro transition-colors group"
            >
              Leer más sobre mí
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
