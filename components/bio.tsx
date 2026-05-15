"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
    <section id="bio" ref={ref} className="bg-arena py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* ── IZQUIERDA — foto ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
          className="relative flex justify-center lg:justify-start"
        >
          {/* Marco decorativo offset */}
          <div className="absolute top-6 left-6 w-full max-w-[380px] aspect-[3/4] rounded-[2rem] border-2 border-lino pointer-events-none" />

          {/* Foto */}
          <div className="relative w-full max-w-[380px] aspect-[3/4] rounded-[2rem] rounded-tr-[4rem] overflow-hidden bg-lino">
            {/* Placeholder — reemplazar con <Image> */}
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-40">
              <div className="w-24 h-24 rounded-full bg-marino/30" />
              <div className="w-32 h-3 rounded-full bg-marino/20" />
              <p className="font-mono text-xs text-marino/50 uppercase tracking-widest mt-1">
                Foto · Marian
              </p>
            </div>
          </div>

          {/* Badge flotante */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
            className="absolute -bottom-5 -right-2 lg:-right-8 bg-marino text-white px-5 py-4 rounded-2xl shadow-xl"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-0.5">
              Desde
            </p>
            <p className="font-playfair font-bold text-2xl leading-none">2016</p>
            <p className="font-sans text-xs text-white/70 mt-0.5">en comunicación</p>
          </motion.div>
        </motion.div>

        {/* ── DERECHA — texto ── */}
        <div className="flex flex-col gap-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota"
          >
            Sobre Marian
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.2, ease: EASE }}
            className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] leading-[1.15]"
          >
            <span className="block">Mariana Sánchez,</span>
            <em className="block italic text-terracota">consultora de comunicación.</em>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="flex flex-col gap-4 font-sans text-gris-tx text-base leading-relaxed max-w-[480px]"
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

          {/* Tags */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.44 }}
            className="flex flex-wrap gap-2"
          >
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="bg-lino text-marino font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-lino/60"
              >
                {tag}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.52 }}
          >
            <Link
              href="/sobre-marian"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-marino hover:text-terracota transition-colors group"
            >
              Leer más sobre mí
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
