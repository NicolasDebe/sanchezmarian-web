"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { AnimatedNumber } from "@/components/ui/animated-number"

const STATS = [
  { value: 50, suffix: "+", label: "apariciones en medios" },
  { value: 30, suffix: "+", label: "clientes" },
  { value: 8,  suffix: "",  label: "años de experiencia" },
  { value: 4,  suffix: "",  label: "servicios" },
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
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) setCount(value)
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay }}
      className="flex flex-col items-center text-center px-6"
    >
      <p className="font-playfair font-bold text-hueso leading-none text-[3.5rem] sm:text-[4.5rem] lg:text-[5rem] tabular-nums">
        <AnimatedNumber
          value={count}
          stiffness={60}
          damping={18}
          mass={1}
          format={(n) => String(Math.floor(n))}
        />
        <span className="text-dorado">{suffix}</span>
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-hueso/40">
        {label}
      </p>
    </motion.div>
  )
}

export function Stats() {
  return (
    <section className="bg-bordo py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Dorado top line */}
        <div className="w-full h-px bg-dorado/20 mb-14 hidden sm:block" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="relative">
              {i < STATS.length - 1 && (
                <span className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-dorado/15" />
              )}
              <StatItem
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={i * 0.12}
              />
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-dorado/20 mt-14 hidden sm:block" />
      </div>
    </section>
  )
}
