"use client"

import type { CSSProperties } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { splitTextByWord, EASE_EXPO as EASE } from "@/lib/animations"

/**
 * Animación de hero de /servicios, extraída para reutilizar en TODOS los heros
 * del sitio: el título entra palabra por palabra (blur que se disuelve + subida
 * escalonada) y los elementos "satélite" (eyebrow, líneas, descripción, CTAs)
 * aparecen recién cuando el título terminó de entrar.
 *
 * La ESTRUCTURA del DOM es estable (siempre spans por palabra) para no romper
 * la hidratación cuando reduced difiere server↔client; con reduced sólo se
 * neutraliza el movimiento (duración 0, sin blur ni desplazamiento).
 */

export const HERO_STAGGER = 0.06
export const HERO_TITLE_DELAY = 0.08

/** Delay base de los satélites: arrancan cuando el título terminó de entrar. */
export function heroSatelliteDelay(...texts: Array<string | undefined>): number {
  const count = splitTextByWord(texts.filter(Boolean).join(" ")).length
  return count * HERO_STAGGER + 0.45
}

/** Delay de una línea que continúa el stagger de la(s) anterior(es). */
export function heroNextLineDelay(...prevTexts: Array<string | undefined>): number {
  const count = splitTextByWord(prevTexts.filter(Boolean).join(" ")).length
  return HERO_TITLE_DELAY + count * HERO_STAGGER
}

const containerVariants = (reduced: boolean, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: reduced ? 0 : HERO_STAGGER, delayChildren: reduced ? 0 : delay },
  },
})
const wordVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: reduced ? 0 : 0.8, ease: EASE },
  },
})

type HeroTag = "h1" | "h2" | "span" | "em" | "p"

/**
 * Título (o línea de título) que entra palabra por palabra al montar.
 * Para títulos de varias líneas: poné el aria-label en el elemento padre,
 * marcá cada línea con `ariaHidden` y encadená delays con heroNextLineDelay().
 */
export function HeroWords({
  text,
  as = "h1",
  delay = HERO_TITLE_DELAY,
  ariaHidden = false,
  className,
  style,
  "data-fkey": dataFkey,
}: {
  text: string
  as?: HeroTag
  delay?: number
  ariaHidden?: boolean
  className?: string
  style?: CSSProperties
  "data-fkey"?: string
}) {
  const reduced = !!useReducedMotion()
  const words = splitTextByWord(text)
  if (words.length === 0) return null

  const MotionTag = motion[as] as typeof motion.h1

  return (
    <MotionTag
      aria-label={ariaHidden ? undefined : text}
      aria-hidden={ariaHidden || undefined}
      variants={containerVariants(reduced, delay)}
      initial="hidden"
      animate="visible"
      className={className}
      style={style}
      data-fkey={dataFkey}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          variants={wordVariants(reduced)}
          className="inline-block"
          style={{ marginRight: "0.25em", willChange: "transform, filter" }}
        >
          {w}
        </motion.span>
      ))}
    </MotionTag>
  )
}

/**
 * Devuelve una fábrica de props para elementos satélite: fade-up corto que
 * arranca en baseDelay (normalmente heroSatelliteDelay(título)) + offset.
 *
 *   const satellite = useHeroSatellite(heroSatelliteDelay(c.h1))
 *   <motion.p {...satellite(0)}>…</motion.p>
 */
export function useHeroSatellite(baseDelay: number) {
  const reduced = !!useReducedMotion()
  return (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.7,
      ease: EASE,
      delay: reduced ? 0 : baseDelay + delay,
    },
  })
}
