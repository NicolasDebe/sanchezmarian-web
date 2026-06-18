"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { two, EASE, type Servicio } from "./types"

const mvp = { once: true, margin: "-60px" } as const

/**
 * Servicios SECUNDARIOS (Prensa + RRPP) — grid de dos columnas, mismo nivel
 * entre sí y subordinados al principal. En mobile se apilan. Cada tarjeta
 * entra con un fade suave staggered al aparecer en viewport.
 */
export function ServiciosSecundarios({
  servicios,
  heading,
  id,
}: {
  servicios: Servicio[]
  heading?: string
  id?: string
}) {
  const reduced = useReducedMotion()
  if (servicios.length === 0) return null

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
      className="overflow-hidden bg-arena"
      aria-label={heading || "Servicios complementarios"}
      style={{ padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 1080 }}>
        {heading && (
          <motion.p
            {...item(0)}
            className="mb-12 font-mono uppercase text-bordo/70"
            style={{ fontSize: 12, letterSpacing: "0.24em" }}
          >
            {heading}
          </motion.p>
        )}

        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {servicios.map((s, idx) => (
            <motion.article
              key={s.key}
              {...item(idx * 0.08)}
              className="flex flex-col rounded-2xl border border-dorado/40 bg-hueso"
              style={{ padding: "clamp(28px, 3vw, 44px)" }}
            >
              <span
                className="inline-flex w-fit items-center rounded-full border border-dorado/70 font-mono uppercase text-bordo"
                style={{ fontSize: 11, letterSpacing: "0.2em", padding: "8px 16px" }}
              >
                {two(idx + 2)} — Servicio
              </span>

              <h3
                className="mt-7 font-playfair font-bold text-negro-bordo"
                style={{ fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
              >
                {s.nombre}
              </h3>

              {s.tagline && (
                <p className="mt-4 font-playfair italic text-bordo" style={{ fontSize: "clamp(17px, 1.5vw, 21px)", lineHeight: 1.3 }}>
                  {s.tagline}
                </p>
              )}

              {s.descripcion && (
                <RichText
                  html={s.descripcion}
                  className="rich-inline mt-5 font-sans text-gris-bordo"
                  style={{ fontSize: 16, lineHeight: 1.6 }}
                />
              )}

              {s.subServicios.length > 0 && (
                <ul className="mt-8 flex flex-col">
                  {s.subServicios.map((sub, i) => (
                    <li
                      key={i}
                      className="flex flex-col"
                      style={{ paddingBlock: 22, borderTop: i === 0 ? "none" : "1px solid rgba(201,168,130,0.35)" }}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-bordo" style={{ fontSize: 12 }}>{two(i + 1)}</span>
                        <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(18px, 1.8vw, 22px)", lineHeight: 1.25 }}>
                          {sub.titulo}
                        </p>
                      </div>
                      {sub.desc && (
                        <RichText
                          html={sub.desc}
                          className="rich-inline mt-2 font-sans text-gris-bordo"
                          style={{ fontSize: 15, lineHeight: 1.6, marginLeft: 27 }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-10">
                <Link
                  href="/#contacto"
                  className="group inline-flex items-center gap-2 rounded-xl bg-bordo px-8 py-3.5 font-sans font-semibold text-hueso transition-all duration-300 hover:bg-bordo-oscuro"
                  style={{ fontSize: 15 }}
                >
                  {s.cta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
