"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

/**
 * Isotipo INFINITO de Marian Sánchez — elemento identitario de marca.
 *
 * Su marca personal gira en torno a CONECTAR; el isotipo es un infinito
 * CALIGRÁFICO (no geométrico) inspirado en el trazo final de su firma
 * manuscrita "Marian Sánchez" (lazo derecho largo y abierto, lazo izquierdo
 * más chico y redondo, cruce corrido a la izquierda — asimétrico y orgánico).
 *
 * Animación "el infinito que nunca cierra" (Opción A — stroke-dasharray):
 * un único segmento visible (~85% del path) viaja en loop perpetuo dejando
 * SIEMPRE un gap (~15%) que se desplaza con él. La conexión nunca se completa:
 * está siempre en proceso. El extremo de avance, con linecap redondo, hace de
 * "punto líder".
 *
 * Accesibilidad/perf:
 * - prefers-reduced-motion → queda DIBUJADO COMPLETO y estático (sin dash).
 * - Sólo anima mientras está en viewport (IntersectionObserver vía useInView).
 * - will-change sólo durante la animación activa.
 * - SSR-safe: se renderiza completo; el dash se activa tras medir el path.
 */

const VIEW_W = 200
const VIEW_H = 80

/* Path caligráfico asimétrico (cerrado). Lazo derecho grande y elongado
   (eco del flourish de la firma), izquierdo más chico; cruce en x≈88 (a la
   izquierda del centro matemático 100). Curvas Bézier orgánicas, sin ángulos. */
const PATH =
  "M 88 42 C 104 19, 151 15, 173 34 C 194 51, 185 69, 157 64 C 129 59, 102 50, 88 42 C 72 33, 43 23, 27 30 C 9 38, 12 55, 31 57 C 53 59, 76 51, 88 42 Z"

type Size = "hero" | "transicion" | "small"

const WIDTHS: Record<Size, string> = {
  hero: "clamp(60px, 7vw, 96px)",
  transicion: "clamp(48px, 5vw, 72px)",
  small: "clamp(32px, 4vw, 48px)",
}

const STROKE: Record<Size, number> = {
  hero: 1.9,
  transicion: 1.7,
  small: 1.5,
}

export function IsotipoInfinito({
  size = "hero",
  color = "currentColor",
  className,
  title = "Conectar",
  entrance = true,
}: {
  size?: Size
  /** Color del trazo. "auto"/omitido → hereda currentColor del contenedor. */
  color?: string
  className?: string
  title?: string
  /** Entrada con scale 0.8 → 1 antes de arrancar el loop. */
  entrance?: boolean
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(wrapRef, { margin: "0px" })

  const [len, setLen] = useState(0)
  const [dur, setDur] = useState(6)

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength())
    // Mobile: loop más lento y contemplativo.
    if (typeof window !== "undefined") {
      setDur(window.matchMedia("(max-width: 640px)").matches ? 8 : 6)
    }
  }, [])

  const animate = len > 0 && !reduced && inView
  const stroke = color === "auto" ? "currentColor" : color

  return (
    <motion.span
      ref={wrapRef}
      aria-hidden={false}
      role="img"
      aria-label={title}
      className={className}
      style={{ display: "inline-block", width: WIDTHS[size], lineHeight: 0, color: stroke }}
      initial={entrance ? { scale: reduced ? 1 : 0.8, opacity: 0 } : false}
      whileInView={entrance ? { scale: 1, opacity: 1 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
      >
        <motion.path
          ref={pathRef}
          d={PATH}
          stroke="currentColor"
          strokeWidth={STROKE[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: animate ? `${len * 0.85} ${len * 0.15}` : undefined,
            willChange: animate ? "stroke-dashoffset" : undefined,
          }}
          animate={animate ? { strokeDashoffset: [0, -len] } : { strokeDashoffset: 0 }}
          transition={
            animate
              ? { duration: dur, ease: "linear", repeat: Infinity }
              : { duration: 0 }
          }
        />
      </svg>
    </motion.span>
  )
}
