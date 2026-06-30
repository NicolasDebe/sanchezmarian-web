"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { SplitWords } from "@/components/ui/split-words"
import { DrawnLine } from "@/components/ui/drawn-line"
import { maskRevealVariants } from "@/lib/animations"
import { two, EASE, type Servicio } from "./types"

const mvp = { once: true, margin: "-60px" } as const

/**
 * Servicio PRINCIPAL (Mentoría por defecto) — bloque editorial estático (v5.1).
 * Dos bandas con variedad cromática:
 *   A) --hueso: izquierda título + descripción (55%), derecha frase ancla
 *      (= el tagline existente) como protagonista del balance (45%).
 *   B) --hueso-oscuro: sub-servicios con jerarquía (01 full, 02/03 compactos),
 *      separadores dorados dibujados, hover con subrayado animado, y el CTA.
 * NO INVENTA contenido: la columna derecha y cada sub sólo se renderizan si su
 * campo existe. Sin scrollytelling ni sticky.
 */
export function ServicioPrincipal({ s, id }: { s: Servicio; id?: string }) {
  const reduced = !!useReducedMotion()
  const mask = maskRevealVariants(1.2, reduced)

  // Siempre anima a visible (instantáneo bajo reduced): evita que el estado
  // inicial del SSR (opacity:0) quede atascado cuando reduced=true en cliente.
  const item = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: mvp,
    transition: { duration: reduced ? 0 : 0.6, ease: EASE, delay: reduced ? 0 : delay },
  })

  const subs = s.subServicios

  return (
    <section id={id} aria-label={s.nombre}>
      {/* ── Banda A — presentación (--hueso) ───────────────────────────── */}
      <div
        className="relative overflow-hidden bg-hueso"
        style={{ padding: "clamp(96px, 14vh, 168px) clamp(24px, 6vw, 96px)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 0% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.35 }}
        />
        <TextureOverlay texture="paperGrain" opacity={0.12} />

        <div className="relative mx-auto grid items-center gap-x-16 gap-y-12 lg:grid-cols-[1.15fr_0.85fr]" style={{ maxWidth: 1180 }}>
          {/* Columna izquierda */}
          <div>
            <motion.div {...item(0)}>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-dorado/70 bg-arena/40 font-mono uppercase text-bordo"
                style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em", padding: "9px 18px" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
                Servicio principal
              </span>
            </motion.div>

            <SplitWords
              as="h2"
              text={s.nombre}
              delay={0.05}
              className="mt-9 font-playfair font-bold text-negro-bordo"
              style={{ fontSize: "calc(clamp(40px, 6vw, 92px) * var(--text-scale))", lineHeight: "var(--lh-tight)", letterSpacing: "-0.035em" }}
            />

            {s.descripcion && (
              <motion.div
                {...item(0.15)}
                className="mt-8 font-sans text-gris-bordo"
                style={{ fontSize: "calc(clamp(17px, 1.4vw, 20px) * var(--text-scale))", lineHeight: "var(--lh-relaxed)", maxWidth: 620 }}
              >
                <RichText html={s.descripcion} className="rich-inline" />
              </motion.div>
            )}
          </div>

          {/* Columna derecha — frase ancla (tagline). Sólo si existe. */}
          {s.tagline && (
            <div className="relative lg:pl-6">
              <span
                aria-hidden
                className="block font-playfair italic text-dorado/30 select-none"
                style={{ fontSize: "calc(clamp(60px, 8vw, 100px) * var(--text-scale))", lineHeight: 0.6, height: "0.55em" }}
              >
                &ldquo;
              </span>
              <motion.p
                variants={mask}
                initial="hidden"
                whileInView="visible"
                viewport={mvp}
                className="mt-4 font-playfair italic text-bordo"
                style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-snug)", letterSpacing: "-0.01em" }}
              >
                {s.tagline}
              </motion.p>
              <div className="mt-8 flex flex-col gap-2">
                <DrawnLine width="clamp(80px, 12vw, 140px)" thickness={1.5} opacity={0.6} delay={0.5} />
                <DrawnLine width="clamp(48px, 7vw, 80px)" thickness={1.5} opacity={0.35} delay={0.62} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Banda B — sub-servicios (--hueso-oscuro) ───────────────────── */}
      {subs.length > 0 && (
        <div
          className="relative overflow-hidden bg-hueso-oscuro"
          style={{ padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)" }}
        >
          <TextureOverlay texture="paperGrain" opacity={0.1} />
          <div className="relative mx-auto" style={{ maxWidth: 1080 }}>
            <motion.p
              {...item(0)}
              className="mb-2 font-mono uppercase text-bordo/70"
              style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.24em" }}
            >
              Cómo trabajamos
            </motion.p>

            <div className="mt-10 flex flex-col">
              {subs.map((sub, i) => {
                const full = i === 0
                return (
                  <div key={i}>
                    {i > 0 && (
                      <DrawnLine width="100%" thickness={1.5} opacity={0.5} className="my-0" />
                    )}
                    <motion.div
                      {...item(0.05 + i * 0.06)}
                      className="group transition-transform duration-300 hover:translate-x-0.5"
                      style={{ paddingBlock: full ? 44 : 30 }}
                    >
                      <div className={full ? "" : "grid items-start gap-x-10 gap-y-2 md:grid-cols-2"}>
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-bordo" style={{ fontSize: full ? "var(--fs-body)" : "var(--fs-caption)" }}>{two(i + 1)}</span>
                          <h3 className="relative inline-block w-fit">
                            <span
                              className="font-playfair font-bold text-negro-bordo"
                              style={{
                                fontSize: full ? "var(--fs-h2)" : "var(--fs-h3)",
                                lineHeight: "var(--lh-snug)",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {sub.titulo}
                            </span>
                            <span
                              aria-hidden
                              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-bordo transition-transform duration-300 group-hover:scale-x-100"
                            />
                          </h3>
                        </div>
                        {sub.desc && (
                          <RichText
                            html={sub.desc}
                            className="rich-inline font-sans text-gris-bordo"
                            style={{
                              fontSize: full ? "var(--fs-lead)" : "calc(15.5px * var(--text-scale))",
                              lineHeight: "var(--lh-relaxed)",
                              maxWidth: 600,
                              marginTop: full ? 14 : 0,
                              marginLeft: full ? 36 : 0,
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>

            <motion.div {...item(0.1)} className="mt-14">
              <Link
                href="/#contacto"
                className="cta-arrow group inline-flex items-center gap-2 rounded-xl bg-bordo px-10 font-sans font-semibold text-hueso transition-all duration-300 hover:bg-bordo-oscuro active:scale-[0.98]"
                style={{ fontSize: "calc(clamp(16px, 1.3vw, 18px) * var(--text-scale))", paddingBlock: "clamp(15px, 1.8vw, 20px)" }}
              >
                {s.cta}
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  )
}
