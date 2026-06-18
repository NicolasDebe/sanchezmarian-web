"use client"

import { motion, useReducedMotion } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Línea decorativa que se "dibuja" al entrar al viewport mediante transform
 * scale (GPU-accelerated, equivalente visual al stroke-dashoffset pero sin
 * medir paths ni romper SSR). Soporta crecer desde un borde o desde el centro.
 */
export function DrawnLine({
  width = 40,
  thickness = 1.5,
  color = "var(--color-dorado)",
  origin = "left",
  vertical = false,
  opacity = 1,
  duration = 0.8,
  delay = 0,
  className,
  style,
}: {
  width?: number | string
  thickness?: number
  color?: string
  origin?: "left" | "center" | "right"
  vertical?: boolean
  opacity?: number
  duration?: number
  delay?: number
  className?: string
  style?: React.CSSProperties
}) {
  const reduced = !!useReducedMotion()
  const transformOrigin = origin === "center" ? "center" : vertical ? (origin === "right" ? "bottom" : "top") : origin
  const scaleAxis = vertical ? "scaleY" : "scaleX"

  // Siempre anima a escala 1 (instantáneo bajo reduced) para no dejar la línea
  // atascada en escala 0 (invisible) tras el SSR cuando reduced=true.
  return (
    <motion.span
      aria-hidden
      className={className}
      style={{
        display: "block",
        width: vertical ? thickness : width,
        height: vertical ? width : thickness,
        background: color,
        opacity,
        transformOrigin,
        ...style,
      }}
      initial={{ transform: `${scaleAxis}(0)` }}
      whileInView={{ transform: `${scaleAxis}(1)` }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduced ? 0 : duration, ease: EASE, delay: reduced ? 0 : delay }}
    />
  )
}
