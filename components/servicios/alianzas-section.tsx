"use client"

import { motion, useReducedMotion } from "motion/react"
import { EASE } from "./types"

const mvp = { once: true, margin: "-60px" } as const

/**
 * Banda de ALIANZAS / CONEXIONES — palabras clave de las disciplinas con las
 * que Marian forma equipo (audiovisual, marketing, ventas…). La lista llega
 * como texto plano (una palabra por línea) desde content_blocks y se parsea a
 * chips. Si no hay ítems, la sección entera no se renderiza.
 */
export function AlianzasSection({
  eyebrow,
  title,
  items,
  id,
}: {
  eyebrow: string
  title: string
  items: string
  id?: string
}) {
  const reduced = useReducedMotion()
  const chips = items
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  if (chips.length === 0) return null

  const item = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: mvp,
          transition: { duration: 0.6, ease: EASE, delay },
        }

  return (
    <section
      id={id}
      className="overflow-hidden bg-hueso"
      aria-label={title || "Alianzas"}
      style={{ padding: "clamp(80px, 12vh, 130px) clamp(24px, 6vw, 96px)" }}
    >
      <div className="mx-auto text-center" style={{ maxWidth: 920 }}>
        {eyebrow && (
          <motion.p {...item(0)} className="font-mono uppercase text-bordo/70" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.24em" }}>
            {eyebrow}
          </motion.p>
        )}

        {title && (
          <motion.p
            {...item(0.06)}
            className="mt-6 font-playfair text-negro-bordo"
            style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-snug)", letterSpacing: "-0.02em" }}
          >
            {title}
          </motion.p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {chips.map((chip, i) => (
            <motion.span
              key={chip}
              {...item(0.1 + i * 0.05)}
              className="inline-flex items-center gap-2 rounded-full border border-dorado/60 bg-arena/40 font-sans text-negro-bordo"
              style={{ fontSize: "calc(clamp(15px, 1.4vw, 18px) * var(--text-scale))", padding: "11px 22px" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
              {chip}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
