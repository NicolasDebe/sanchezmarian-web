"use client"

import { createElement } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { splitTextByWord } from "@/lib/animations"

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Split-text por palabras para títulos Playfair > 40px: cada palabra entra
 * con stagger + blur que se disuelve. La ESTRUCTURA del DOM es estable (siempre
 * spans por palabra) para no romper la hidratación cuando reduced difiere
 * server↔client (#418); con reduced sólo se desactiva la animación.
 */
export function SplitWords({
  text,
  as = "h2",
  className,
  style,
  stagger = 0.08,
  delay = 0,
}: {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  style?: React.CSSProperties
  stagger?: number
  delay?: number
}) {
  const reduced = !!useReducedMotion()
  const words = splitTextByWord(text)
  if (words.length === 0) return null

  // El cliente SIEMPRE anima a "visible" (whileInView). El SSR rinde "hidden";
  // si whileInView quedara undefined bajo reduced, las palabras se atascarían
  // ocultas. Bajo reduced se neutraliza el movimiento (duración 0, sin blur).
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren: reduced ? 0 : delay } },
  }
  const word: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: "0.5em", filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduced ? 0 : 0.7, ease: EASE } },
  }

  const MotionTag = motion[as]

  return createElement(
    MotionTag as typeof motion.h2,
    {
      "aria-label": text,
      className,
      style,
      variants: container,
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, margin: "-60px" },
    },
    words.map((w, i) => (
      <motion.span
        key={i}
        aria-hidden
        variants={word}
        className="inline-block"
        style={{ marginRight: "0.25em", willChange: "transform, filter" }}
      >
        {w}
      </motion.span>
    )),
  )
}
