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
      // Stagger de lista 45ms (criterio 30-50ms): cascada perceptible sin demora.
      staggerChildren: 0.045,
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
   Micro-interacciones (hover / press / toggle) — criterios ui-ux-pro-max.
   Springs de motion en lugar de cubic-bezier; 150-300ms percibidos.
   Todas las animaciones de motion son interrumpibles por default (un nuevo
   gesto reapunta el spring al instante), así que el tap cancela en curso.
   ════════════════════════════════════════════════════════════════════════ */

/** Spring rápido para feedback de press/hover en CTAs y controles (~180ms). */
export const springSnappy = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 } as const

/** Spring algo más suave para entradas de UI (barras, paneles). */
export const springGentle = { type: "spring", stiffness: 320, damping: 30, mass: 0.7 } as const

/** Escala de feedback al presionar un CTA principal. */
export const tapScale = 0.97

/**
 * Props listas para un CTA principal con motion: hover sutil + press a 0.97,
 * ambos con spring. Spread directo en `<motion.a>` / `<motion.button>` / MotionLink.
 */
export const pressableCta = {
  whileHover: { y: -2 },
  whileTap: { scale: tapScale },
  transition: springSnappy,
} as const

/** Igual que pressableCta pero sin levantar en hover (para botones full-width). */
export const pressableFlat = {
  whileTap: { scale: tapScale },
  transition: springSnappy,
} as const

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
