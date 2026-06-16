"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

type Seg = { id: string; label: string }

/**
 * Indicador lateral derecho (desktop). 3 segmentos verticales — uno por
 * servicio. El segmento activo se expande (--bordo) y, si es Mentoría,
 * muestra sub-marcas horizontales que se iluminan con cada frame del
 * scrollytelling. Self-contained: lee rects por id en cada scroll (rAF).
 */
export function LateralIndicator({ segments, scrollyId }: { segments: Seg[]; scrollyId: string }) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [subMarks, setSubMarks] = useState(0)
  const [activeMark, setActiveMark] = useState(-1)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const scrolly = document.getElementById(scrollyId)
    const nMarks = scrolly ? Number(scrolly.dataset.frames ?? 0) : 0

    const compute = () => {
      raf.current = null
      setSubMarks(nMarks)
      const mid = window.innerHeight / 2
      let best = 0
      let bestDist = Infinity
      segments.forEach((seg, i) => {
        const el = document.getElementById(seg.id)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) {
          const dist = Math.abs((r.top + r.bottom) / 2 - mid)
          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        }
      })
      setActive(best)

      if (scrolly && nMarks > 0) {
        const r = scrolly.getBoundingClientRect()
        const usable = r.height - window.innerHeight
        const p = usable > 0 ? Math.min(1, Math.max(0, -r.top / usable)) : 0
        setActiveMark(r.top <= mid && r.bottom >= mid ? Math.min(nMarks - 1, Math.floor(p * nMarks)) : -1)
      }
    }

    const onScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(compute)
    }
    onScroll() // primer cálculo diferido a rAF (no setState síncrono en el effect)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf.current != null) cancelAnimationFrame(raf.current)
    }
  }, [segments, scrollyId])

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 200, damping: 26 }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center md:flex"
      style={{ right: "clamp(16px, 2vw, 32px)", gap: 24 }}
    >
      {segments.map((seg, i) => {
        const isActive = i === active
        const showMarks = isActive && i === 0 && subMarks > 0
        return (
          <div key={seg.id} className="flex items-center" style={{ gap: 10 }}>
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                color: isActive ? "var(--color-bordo)" : "var(--color-dorado)",
                opacity: isActive ? 1 : 0.55,
                transition: "color 0.4s ease, opacity 0.4s ease",
              }}
            >
              {seg.label}
            </span>
            <motion.div
              className="relative flex flex-col items-center justify-center overflow-visible rounded-full"
              animate={{ height: isActive ? 160 : 80, width: isActive ? 2 : 1, backgroundColor: isActive ? "var(--color-bordo)" : "rgba(201,168,130,0.3)" }}
              transition={spring}
            >
              {showMarks && (
                <div className="absolute inset-0 flex flex-col items-center justify-between py-2">
                  {Array.from({ length: subMarks }).map((_, m) => (
                    <motion.span
                      key={m}
                      className="block rounded-full"
                      animate={{
                        width: m === activeMark ? 12 : 6,
                        backgroundColor: m <= activeMark ? "var(--color-bordo)" : "rgba(102,0,31,0.25)",
                      }}
                      transition={{ duration: reduced ? 0 : 0.3 }}
                      style={{ height: 2 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
