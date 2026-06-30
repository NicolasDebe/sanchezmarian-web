"use client"

import { useEffect, useRef, useState } from "react"
import { fallbacksFor } from "@/lib/home-schema"

/** Separa el prefijo numérico del sufijo: "100+" -> { value: "100", suffix: "+" }. */
function splitNumber(raw: string): { value: string; suffix: string } {
  const m = raw.match(/^([\d.,\s]*)(.*)$/)
  if (!m) return { value: raw, suffix: "" }
  return { value: m[1].trim(), suffix: m[2] }
}

function StatItem({
  value,
  suffix,
  label,
  delay,
}: {
  value: string
  suffix: string
  label: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); io.disconnect() }
      },
      { rootMargin: "-60px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center px-3 py-4 sm:px-6"
      style={{
        opacity: visible ? 1 : 0.35,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      <p className="font-playfair font-bold text-negro-bordo leading-none text-[calc(2.75rem*var(--text-scale))] sm:text-[calc(4rem*var(--text-scale))] lg:text-[calc(5rem*var(--text-scale))] tabular-nums">
        {value}
        <span className="text-dorado">{suffix}</span>
      </p>
      <p className="mt-4 font-mono text-[var(--fs-micro)] sm:text-[var(--fs-eyebrow)] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-gris-bordo/60">
        {label}
      </p>
    </div>
  )
}

export function Stats({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("stats"), ...content }
  const stats = [1, 2, 3, 4].map((n) => {
    const { value, suffix } = splitNumber(c[`stat_${n}_number`] ?? "")
    return { value, suffix, label: c[`stat_${n}_label`] ?? "" }
  })

  return (
    <section className="bg-hueso py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="relative">
              {i < stats.length - 1 && (
                <span className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-14 bg-dorado/30" />
              )}
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={i * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
