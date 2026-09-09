"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ResenaForm } from "@/components/resena-form"
import {
  HeroWords,
  heroNextLineDelay,
  heroSatelliteDelay,
  useHeroSatellite,
} from "@/components/ui/hero-reveal"
import { fadeUp, fadeUpStagger } from "@/lib/animations"

/**
 * Página autónoma de carga de reseñas: se comparte por WhatsApp y se abre sola,
 * sin la navegación del sitio. Por eso arriba va solo el nombre (link a home) y
 * el ancho está pensado mobile-first — la mayoría entra desde el teléfono.
 *
 * El copy es fijo por ahora; cuando se migre al CMS sale de un esquema
 * `resenas` con el patrón pre/accent, igual que el resto de las páginas.
 */

const COPY = {
  eyebrow: "Tu experiencia",
  h1_pre: "Contá cómo fue",
  h1_accent: "trabajar con Marian.",
  // Dos oraciones: qué pasa con lo que escribís, y que hay una revisión.
  subtitle:
    "Tu reseña se publica firmada, con tu nombre y sin editar una coma de lo que escribas. Antes de salir pasa por una revisión del equipo.",
} as const

export function ResenaNuevaContent() {
  const satDelay = heroSatelliteDelay(COPY.h1_pre, COPY.h1_accent)
  const satellite = useHeroSatellite(satDelay)

  return (
    <div className="min-h-screen bg-hueso">
      {/* Cabecera mínima: la página se abre sola desde un link compartido, así
          que necesita al menos una salida hacia el sitio. */}
      <header className="mx-auto flex max-w-[680px] items-center px-5 pt-7 sm:px-8">
        <Link
          href="/"
          className="font-playfair text-negro-bordo transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bordo"
          style={{ fontSize: "var(--fs-lead)" }}
        >
          Marian<span className="text-bordo">.</span>
        </Link>
      </header>

      <main
        className="mx-auto max-w-[680px] px-5 sm:px-8"
        style={{ paddingTop: "clamp(32px, 6vh, 56px)", paddingBottom: "clamp(56px, 10vh, 96px)" }}
      >
        {/* ── Hero ── */}
        <section className="mb-10 sm:mb-12">
          <motion.p
            {...satellite(0)}
            className="mb-4 font-mono uppercase tracking-[0.18em] text-bordo/70"
            style={{ fontSize: "var(--fs-eyebrow)" }}
          >
            {COPY.eyebrow}
          </motion.p>

          <h1
            aria-label={`${COPY.h1_pre} ${COPY.h1_accent}`}
            className="m-0 font-playfair font-bold text-negro-bordo"
          >
            <HeroWords
              text={COPY.h1_pre}
              as="span"
              ariaHidden
              style={{
                display: "block",
                fontSize: "calc(clamp(1.3rem, 2.5vw, 2rem) * var(--text-scale))",
                fontWeight: 600,
                opacity: 0.82,
              }}
            />
            <HeroWords
              text={COPY.h1_accent}
              as="em"
              ariaHidden
              delay={heroNextLineDelay(COPY.h1_pre)}
              style={{
                display: "block",
                fontSize: "calc(clamp(1.9rem, 4.2vw, 3rem) * var(--text-scale))",
                fontStyle: "italic",
                color: "#66001F",
                lineHeight: 1.12,
              }}
            />
          </h1>

          <motion.p
            {...satellite(0.1)}
            className="mt-5 max-w-[52ch] font-sans leading-relaxed text-gris-bordo"
            style={{ fontSize: "var(--fs-body-lg)" }}
          >
            {COPY.subtitle}
          </motion.p>

          <motion.div
            {...satellite(0.18)}
            className="mt-7 h-px w-full bg-gris-bordo/15"
          />
        </section>

        {/* ── Formulario ── */}
        <motion.section
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          style={{ animationDelay: `${satDelay}s` }}
        >
          <motion.div variants={fadeUp} transition={{ delay: satDelay * 0.5 }}>
            <ResenaForm />
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}
