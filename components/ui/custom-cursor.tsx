"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react"

/**
 * Cursor custom de escritorio: un anillo que sigue al puntero con un leve lag
 * (spring) y se agranda sobre elementos interactivos. Acompaña al cursor nativo
 * (no lo oculta) para no romper el caret de los inputs ni la accesibilidad.
 *
 * Se activa solo en punteros finos (mouse). En touch/coarse y bajo
 * prefers-reduced-motion no se monta. pointer-events:none → nunca bloquea clics.
 */
export function CustomCursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springCfg = { stiffness: 350, damping: 28, mass: 0.4 }
  const ringX = useSpring(x, springCfg)
  const ringY = useSpring(y, springCfg)

  useEffect(() => {
    if (reduced) return
    const fine = window.matchMedia("(pointer: fine)")
    if (!fine.matches) return
    setEnabled(true)

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = e.target as HTMLElement | null
      setHovering(
        !!el?.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor='hover']"),
      )
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [reduced, x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ x: ringX, y: ringY }}
    >
      <motion.span
        className="block rounded-full border"
        style={{
          translateX: "-50%",
          translateY: "-50%",
          borderColor: "var(--color-dorado)",
          mixBlendMode: "difference",
        }}
        animate={{
          width: hovering ? 44 : 26,
          height: hovering ? 44 : 26,
          opacity: hovering ? 0.9 : 0.6,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.5 }}
      />
    </motion.div>
  )
}
