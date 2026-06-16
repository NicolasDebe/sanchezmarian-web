"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { cn } from "@/lib/utils"
import { two, EASE, type Servicio } from "./types"

const mvp = { once: true, margin: "-60px" } as const

/**
 * Servicios secundarios (Prensa 02 / RRPP 03) — single-column "manifiesto".
 * Estructura del v4.2 mantenida; cada bloque entra con fade + translateY
 * staggered al hacer scroll. RRPP usa fondo --bordo.
 */
export function ServicioSegment({
  s,
  num,
  dark,
  id,
}: {
  s: Servicio
  num: string
  dark: boolean
  id?: string
}) {
  const reduced = useReducedMotion()
  const bg = dark ? "bg-bordo" : "bg-hueso"
  const titleColor = dark ? "text-hueso" : "text-negro-bordo"
  const accent = dark ? "text-dorado" : "text-bordo"
  const descColor = dark ? "text-hueso/85" : "text-gris-bordo"
  const subTitle = dark ? "text-hueso" : "text-negro-bordo"
  const subDesc = dark ? "text-hueso/75" : "text-gris-bordo"
  const lineColor = dark ? "rgba(254,252,239,0.25)" : "rgba(201,168,130,0.4)"
  const pillBorder = dark ? "rgba(254,252,239,0.5)" : "rgba(201,168,130,0.7)"

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
      className={cn("overflow-hidden", bg)}
      aria-label={s.nombre}
      style={{ padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <motion.div {...item(0)}>
          <span
            className={cn("inline-flex items-center rounded-full font-mono uppercase", accent)}
            style={{ fontSize: 11, letterSpacing: "0.2em", padding: "10px 18px", border: `1px solid ${pillBorder}` }}
          >
            {num} — Servicio
          </span>
        </motion.div>

        <motion.h2
          {...item(0.05)}
          className={cn("mt-8 font-playfair font-bold", titleColor)}
          style={{ fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 1.04, letterSpacing: "-0.03em" }}
        >
          {s.nombre}
        </motion.h2>

        {s.tagline && (
          <motion.p {...item(0.1)} className={cn("mt-5 font-playfair italic", accent)} style={{ fontSize: "clamp(18px, 1.6vw, 24px)" }}>
            {s.tagline}
          </motion.p>
        )}

        {s.descripcion && (
          <motion.div {...item(0.15)} className={cn("mt-7 font-sans", descColor)} style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720 }}>
            <RichText html={s.descripcion} className="rich-inline" />
          </motion.div>
        )}

        {s.subServicios.length > 0 && (
          <div className="mt-16 flex flex-col">
            {s.subServicios.map((sub, i) => (
              <motion.div
                key={i}
                {...item(0.1 + i * 0.06)}
                className="flex flex-col"
                style={{ paddingBlock: 48, borderTop: i === 0 ? "none" : `1px solid ${lineColor}` }}
              >
                <div className="flex items-baseline gap-4">
                  <span className={cn("font-mono", accent)} style={{ fontSize: 13 }}>{two(i + 1)}</span>
                  <p className={cn("font-playfair font-bold", subTitle)} style={{ fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.2 }}>{sub.titulo}</p>
                </div>
                {sub.desc && (
                  <RichText html={sub.desc} className={cn("rich-inline mt-3 font-sans", subDesc)} style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 680, marginLeft: 36 }} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div {...item(0.1)} className="mt-14">
          <Link
            href="/#contacto"
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl px-9 py-4 font-sans font-semibold transition-all duration-300",
              dark ? "bg-hueso text-bordo hover:bg-arena" : "bg-bordo text-hueso hover:bg-bordo-oscuro",
            )}
            style={{ fontSize: 15 }}
          >
            {s.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
