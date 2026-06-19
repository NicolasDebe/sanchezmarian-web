"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ExternalLink } from "lucide-react"
import type { Clipping } from "@/data/clippings"

// ─── Variants ─────────────────────────────────────────────────────────────────
// Inspired by fadeLeft / fadeRight in @/lib/animations, adapted for carousel
// (x ±60 en lugar de ±32, sin rotate para mayor limpieza a este tamaño)

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN  = [0.4, 0, 1, 1] as const

const groupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
  exit:   { transition: { staggerChildren: 0.04 } },
}

const cardVariants = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  exit:    { opacity: 0, x:  60, transition: { duration: 0.25, ease: EASE_IN } },
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function DestacadaCard({ c }: { c: Clipping }) {
  const [hov, setHov] = useState(false)

  return (
    <a
      href={c.link}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex flex-col gap-4 h-full"
      style={{
        padding: 32,
        borderRadius: 16,
        textDecoration: "none",
        minHeight: 240,
        background: hov ? "rgba(254,252,239,0.10)" : "rgba(254,252,239,0.06)",
        border: `1px solid ${hov ? "rgba(254,252,239,0.3)" : "rgba(254,252,239,0.1)"}`,
        transform: hov ? "translateY(-6px)" : "translateY(0px)",
        transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <ExternalLink
        size={16}
        strokeWidth={1.5}
        className="absolute"
        style={{
          top: 32,
          right: 32,
          color: "var(--color-hueso)",
          opacity: hov ? 1 : 0.3,
          transition: "opacity 0.2s",
        }}
      />

      <span
        className="font-mono uppercase w-fit"
        style={{
          fontSize: 9,
          padding: "3px 10px",
          borderRadius: 999,
          background: "rgba(201,168,130,0.15)",
          color: "var(--color-dorado)",
          letterSpacing: "0.1em",
        }}
      >
        {c.alcance}
      </span>

      <span
        className="font-mono uppercase"
        style={{ fontSize: 12, letterSpacing: "0.15em", color: "rgba(254,252,239,0.6)" }}
      >
        {c.medio}
      </span>

      <p
        className="font-playfair flex-1"
        style={{ fontSize: 20, color: "var(--color-hueso)", lineHeight: 1.3 }}
      >
        {c.titular}
      </p>

      <span className="font-sans" style={{ fontSize: 12, color: "rgba(254,252,239,0.4)" }}>
        {c.cliente}
      </span>

      <span
        className="font-mono absolute"
        style={{ bottom: 32, right: 32, fontSize: 11, color: "var(--color-dorado)" }}
      >
        {c.año}
      </span>
    </a>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

const GROUPS = 4

interface Props {
  apariciones: Clipping[]
}

export function DestacadasRotativo({ apariciones }: Props) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [dotHov, setDotHov] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentGroupIndex((i) => (i + 1) % GROUPS)
    }, 3000)
    return () => clearInterval(timer)
  }, [isPaused])

  const handleDotClick = (idx: number) => {
    setCurrentGroupIndex(idx)
    setIsPaused(true)
    const resume = setTimeout(() => setIsPaused(false), 5000)
    return () => clearTimeout(resume)
  }

  const group = apariciones.slice(currentGroupIndex * 3, currentGroupIndex * 3 + 3)

  return (
    <div>
      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGroupIndex}
          variants={groupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {group.map((c) => (
            <motion.div key={c.id} variants={cardVariants} className="flex flex-col">
              <DestacadaCard c={c} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div
        className="flex items-center justify-center"
        style={{ marginTop: 24 }}
        onMouseEnter={() => setDotHov(true)}
        onMouseLeave={() => setDotHov(false)}
      >
        {Array.from({ length: GROUPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            aria-label={`Grupo ${i + 1}`}
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                transition: "all 0.2s ease",
                background: i === currentGroupIndex ? "var(--color-hueso)" : "transparent",
                border: `1px solid ${
                  i === currentGroupIndex
                    ? "var(--color-hueso)"
                    : "rgba(254,252,239,0.3)"
                }`,
                opacity: dotHov ? 1 : i === currentGroupIndex ? 1 : 0.6,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
