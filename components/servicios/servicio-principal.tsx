"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { cn } from "@/lib/utils"
import { two, EASE, type Servicio } from "./types"

const mvp = { once: true, margin: "-60px" } as const

/**
 * Servicio PRINCIPAL (Mentoría por defecto) — bloque editorial estático,
 * prominente. Reemplaza al scrollytelling sticky (v4.x): nada pegado al
 * costado, nada de scroll-scrub. El contenido entra UNA vez con un fade
 * suave al aparecer en viewport (whileInView) y se queda fijo.
 *
 * Jerarquía visual respecto a los secundarios: título más grande, eyebrow
 * "Servicio principal", sub-servicios en lista vertical amplia con línea
 * dorada de separación.
 */
export function ServicioPrincipal({ s, id }: { s: Servicio; id?: string }) {
  const reduced = useReducedMotion()

  const item = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: mvp,
          transition: { duration: 0.6, ease: EASE, delay },
        }

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-hueso"
      aria-label={s.nombre}
      style={{ padding: "clamp(96px, 14vh, 168px) clamp(24px, 6vw, 96px)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 0% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.35 }}
      />
      <TextureOverlay texture="paperGrain" opacity={0.12} />

      <div className="relative mx-auto" style={{ maxWidth: 1080 }}>
        <motion.div {...item(0)} className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-dorado/70 bg-arena/40 font-mono uppercase text-bordo"
            style={{ fontSize: 11, letterSpacing: "0.2em", padding: "9px 18px" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
            Servicio principal
          </span>
        </motion.div>

        <motion.h2
          {...item(0.05)}
          className="mt-9 font-playfair font-bold text-negro-bordo"
          style={{ fontSize: "clamp(44px, 7vw, 104px)", lineHeight: 1.02, letterSpacing: "-0.035em", maxWidth: "15ch" }}
        >
          {s.nombre}
        </motion.h2>

        {s.tagline && (
          <motion.p
            {...item(0.1)}
            className="mt-6 font-playfair italic text-bordo"
            style={{ fontSize: "clamp(20px, 2vw, 30px)", lineHeight: 1.3, maxWidth: "24ch" }}
          >
            {s.tagline}
          </motion.p>
        )}

        {s.descripcion && (
          <motion.div
            {...item(0.15)}
            className="mt-8 font-sans text-gris-bordo"
            style={{ fontSize: "clamp(17px, 1.4vw, 20px)", lineHeight: 1.65, maxWidth: 760 }}
          >
            <RichText html={s.descripcion} className="rich-inline" />
          </motion.div>
        )}

        {s.subServicios.length > 0 && (
          <div className="mt-16 grid gap-y-0" role="list">
            {s.subServicios.map((sub, i) => (
              <motion.div
                key={i}
                {...item(0.1 + i * 0.06)}
                role="listitem"
                className="grid gap-x-8 gap-y-3 md:grid-cols-[auto_1fr]"
                style={{ paddingBlock: 40, borderTop: i === 0 ? "none" : "1px solid rgba(201,168,130,0.4)" }}
              >
                <p
                  className="font-playfair font-bold text-negro-bordo"
                  style={{ fontSize: "clamp(24px, 2.8vw, 36px)", lineHeight: 1.15 }}
                >
                  <span className="mr-4 font-mono align-middle text-bordo" style={{ fontSize: 14 }}>{two(i + 1)}</span>
                  {sub.titulo}
                </p>
                {sub.desc && (
                  <RichText
                    html={sub.desc}
                    className="rich-inline font-sans text-gris-bordo"
                    style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 560 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div {...item(0.1)} className="mt-14">
          <Link
            href="/#contacto"
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl bg-bordo px-10 font-sans font-semibold text-hueso transition-all duration-300 hover:bg-bordo-oscuro",
            )}
            style={{ fontSize: "clamp(16px, 1.3vw, 18px)", paddingBlock: "clamp(15px, 1.8vw, 20px)" }}
          >
            {s.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
