"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { value: 100, suffix: "+", label: "apariciones en medios" },
  { value: 10,  suffix: "+", label: "clientes" },
  { value: 10,  suffix: "+", label: "años de experiencia" },
  { value: 3,   suffix: "",  label: "servicios especializados" },
]

function StatItem({
  value,
  suffix,
  label,
  delay,
}: {
  value: number
  suffix: string
  label: string
  delay: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className="flex flex-col items-center text-center px-6 py-4"
    >
      <p className="font-playfair font-bold text-negro-bordo leading-none text-[4rem] sm:text-[4.5rem] lg:text-[5rem] tabular-nums">
        {value}
        <span className="text-dorado">{suffix}</span>
      </p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-gris-bordo/60">
        {label}
      </p>
    </motion.div>
  )
}

export function Stats() {
  return (
    <section className="bg-hueso py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="relative">
              {i < STATS.length - 1 && (
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
