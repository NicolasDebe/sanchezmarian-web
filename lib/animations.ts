import type { Variants } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    rotate: -1.5,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  },
}

export const fadeUpStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32, rotate: 1 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.55, ease: EASE },
  },
}

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32, rotate: -1 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.55, ease: EASE },
  },
}

export const revealCard: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotate: -2,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
}

export const viewportOnce = { once: true, margin: "-80px" } as const

/* ════════════════════════════════════════════════════════════════════════
   Polish /servicios (v5.1) — helpers de animación editorial.
   EASE compartido (expo-out) reexportado para los componentes nuevos.
   ════════════════════════════════════════════════════════════════════════ */
export const EASE_EXPO = EASE

/** Parte un texto en palabras (preservando que no queden vacíos). */
export function splitTextByWord(text: string): string[] {
  return (text ?? "").split(/\s+/).filter(Boolean)
}

/** Contenedor para split-text por palabra: orquesta el stagger de los hijos. */
export const wordsContainer: Variants = {
  hidden: {},
  visible: (stagger = 0.08) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
}

/** Cada palabra entra desde abajo con blur que se disuelve. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
}

/**
 * Mask reveal con clip-path inset: el contenido se descubre de izquierda a
 * derecha. Útil para frases ancla en cursiva.
 */
export function maskRevealVariants(duration = 1.2, reduced = false): Variants {
  return {
    hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      transition: { duration: reduced ? 0 : duration, ease: EASE },
    },
  }
}

/**
 * "Dibujo" de una línea/path SVG vía pathLength (motion lo anima nativamente,
 * equivalente a stroke-dashoffset pero más simple y robusto).
 */
export function drawLineVariants(duration = 0.8, delay = 0): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration, ease: EASE, delay },
        opacity: { duration: 0.2, delay },
      },
    },
  }
}
