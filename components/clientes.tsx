"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

// TODO: reemplazar por logos reales cuando Marian los envíe
const CLIENTES = [
  "Bolsa de Comercio de Mendoza",
  "Colegio Notarial de Mendoza",
  "Grupo Presidente",
  "Capilla Carlos Acutis",
  "Dra. Elina Meneo",
  "Escuela de Vendimia Chakaymanta",
  "QuienVino App",
  "Agrocosecha",
  "Eugenia Bizzoto / Fuerza Silenciosa",
  "Cluster Mendoza Regenera",
  "Flor Mouradian, Psicóloga",
]

function Track() {
  return (
    <div className="flex items-center shrink-0" aria-hidden>
      {CLIENTES.map((name) => (
        <span key={name} className="flex items-center">
          <span className="font-sans text-sm font-medium text-negro-bordo whitespace-nowrap px-8 cursor-default select-none grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {name}
          </span>
          <span className="text-dorado/40 text-xs pointer-events-none select-none">·</span>
        </span>
      ))}
    </div>
  )
}

export function Clientes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [paused, setPaused] = useState(false)

  return (
    <section ref={ref} className="bg-hueso py-16 lg:py-20 overflow-hidden">

      {/* Header centrado */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: EASE }}
        className="text-center px-6 mb-10"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo mb-3">
          Comunidad
        </p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
          className="w-10 h-px bg-dorado mx-auto mb-4"
          style={{ transformOrigin: "center" }}
        />
        <h2 className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.25rem] leading-[1.15] mb-3">
          Marcas que confiaron en Marian.
        </h2>
        <p className="font-sans text-gris-bordo text-sm">
          100+ apariciones en medios nacionales y provinciales.
        </p>
      </motion.div>

      {/* Marquee infinito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
        aria-label="Clientes de Marian Sánchez"
      >
        {/* Fade izquierda */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--color-hueso), transparent)" }}
        />
        {/* Fade derecha */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--color-hueso), transparent)" }}
        />

        <div
          className="flex py-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            animation: "marquee-scroll 30s linear infinite",
            animationPlayState: paused ? "paused" : "running",
            willChange: "transform",
          }}
        >
          <Track />
          <Track />
        </div>
      </motion.div>

    </section>
  )
}
