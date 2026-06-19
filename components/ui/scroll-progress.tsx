"use client"

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react"

/**
 * Barra de progreso de scroll (3px, dorado) fija arriba de todo. Para páginas
 * largas (/casos-de-exito). El avance se suaviza con un spring; bajo
 * prefers-reduced-motion sigue el progreso sin lag.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 })

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-dorado"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  )
}
