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
 * Servicios SECUNDARIOS (v5.1) — ya no son cards en grid, sino dos secciones
 * full-width alternadas para dar ritmo cromático y jerarquía editorial:
 *   · 1er secundario → fondo --hueso-oscuro, split 60/40 (contenido | ancla)
 *   · 2do secundario → fondo --bordo (texto claro), espejo 40/60
 * En mobile cada sección apila el contenido y debajo la composición lateral.
 * NO INVENTA: la columna de frase ancla (= tagline) sólo aparece si existe.
 */
export function ServiciosSecundarios({
  servicios,
  id,
}: {
  servicios: Servicio[]
  id?: string
}) {
  if (servicios.length === 0) return null
  return (
    <div id={id}>
      {servicios.map((s, idx) => (
        <SecondaryService key={s.key} s={s} dark={idx % 2 === 1} mirror={idx % 2 === 1} />
      ))}
    </div>
  )
}

function SecondaryService({ s, dark, mirror }: { s: Servicio; dark: boolean; mirror: boolean }) {
  const reduced = !!useReducedMotion()
  const mask = maskRevealVariants(1.1, reduced)

  // Siempre anima a visible (instantáneo bajo reduced): evita el atasco del
  // estado inicial SSR (opacity:0) cuando reduced=true en cliente.
  const item = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: mvp,
    transition: { duration: reduced ? 0 : 0.6, ease: EASE, delay: reduced ? 0 : delay },
  })

  // Tokens cromáticos según fondo.
  const txTitle = dark ? "text-hueso" : "text-negro-bordo"
  const txBody = dark ? "text-hueso/75" : "text-gris-bordo"
  const txEyebrow = dark ? "text-dorado" : "text-bordo/70"
  const txAnchor = dark ? "text-dorado" : "text-bordo"
  const sep = dark ? 0.25 : 0.5
  const hasAnchor = !!s.tagline

  const content = (
    <div className={mirror ? "order-1 lg:order-2" : "order-1"}>
      <motion.p
        {...item(0)}
        className={`font-mono uppercase ${txEyebrow}`}
        style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.24em" }}
      >
        ● Servicio {s.numero}
      </motion.p>

      <SplitWords
        as="h3"
        text={s.nombre}
        delay={0.05}
        className={`mt-6 font-playfair font-bold ${txTitle}`}
        style={{ fontSize: "var(--fs-h1)", lineHeight: "var(--lh-tight)", letterSpacing: "-0.025em" }}
      />

      {s.descripcion && (
        <motion.div {...item(0.15)} className={`mt-6 font-sans ${txBody}`} style={{ fontSize: "calc(clamp(16px, 1.3vw, 18px) * var(--text-scale))", lineHeight: "var(--lh-relaxed)", maxWidth: 580 }}>
          <RichText html={s.descripcion} className="rich-inline" />
        </motion.div>
      )}

      {s.subServicios.length > 0 && (
        <div className="mt-10 flex flex-col">
          {s.subServicios.map((sub, i) => (
            <div key={i}>
              {i > 0 && (
                <DrawnLine width="100%" thickness={1.5} opacity={sep} color={dark ? "var(--color-dorado)" : "var(--color-dorado)"} />
              )}
              <motion.div {...item(0.1 + i * 0.06)} className="group" style={{ paddingBlock: 22 }}>
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono ${dark ? "text-dorado" : "text-bordo"}`} style={{ fontSize: "var(--fs-eyebrow)" }}>{two(i + 1)}</span>
                  <h4 className="relative inline-block w-fit">
                    <span className={`font-playfair font-bold ${txTitle}`} style={{ fontSize: "var(--fs-h4)", lineHeight: "var(--lh-snug)" }}>
                      {sub.titulo}
                    </span>
                    <span aria-hidden className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${dark ? "bg-dorado" : "bg-bordo"}`} />
                  </h4>
                </div>
                {sub.desc && (
                  <RichText html={sub.desc} className={`rich-inline mt-2 font-sans ${txBody}`} style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-base)", marginLeft: 27 }} />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      )}

      <motion.div {...item(0.12)} className="mt-12">
        <Link
          href="/#contacto"
          className={
            dark
              ? "cta-invert cta-arrow group inline-flex items-center gap-2 rounded-xl border-2 border-hueso bg-hueso px-9 font-sans font-semibold text-bordo transition-all duration-300 active:scale-[0.98]"
              : "cta-arrow group inline-flex items-center gap-2 rounded-xl bg-bordo px-9 font-sans font-semibold text-hueso transition-all duration-300 hover:bg-bordo-oscuro active:scale-[0.98]"
          }
          style={{ fontSize: "var(--fs-body-lg)", paddingBlock: "clamp(14px, 1.6vw, 18px)" }}
        >
          {s.cta}
          <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </motion.div>
    </div>
  )

  const composition = hasAnchor ? (
    <div className={`relative ${mirror ? "order-2 lg:order-1 lg:pr-6" : "order-2 lg:pl-6"}`}>
      <span
        aria-hidden
        className={`block font-playfair italic select-none ${dark ? "text-dorado/40" : "text-dorado/30"}`}
        style={{ fontSize: "calc(clamp(56px, 7vw, 92px) * var(--text-scale))", lineHeight: 0.6, height: "0.55em" }}
      >
        &ldquo;
      </span>
      <motion.p
        variants={mask}
        initial="hidden"
        whileInView="visible"
        viewport={mvp}
        className={`mt-4 font-playfair italic ${txAnchor}`}
        style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-snug)" }}
      >
        {s.tagline}
      </motion.p>
      <div className="mt-7 flex flex-col gap-2">
        <DrawnLine width="clamp(70px, 10vw, 120px)" thickness={1.5} opacity={dark ? 0.7 : 0.6} delay={0.5} />
        <DrawnLine width="clamp(44px, 6vw, 70px)" thickness={1.5} opacity={dark ? 0.4 : 0.35} delay={0.62} />
      </div>
    </div>
  ) : null

  const cols = mirror ? "lg:grid-cols-[1fr_1.5fr]" : "lg:grid-cols-[1.5fr_1fr]"

  return (
    <section
      className={`relative overflow-hidden ${dark ? "bg-bordo" : "bg-hueso-oscuro"}`}
      aria-label={s.nombre}
      style={{ padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)" }}
    >
      <TextureOverlay texture="paperGrain" opacity={dark ? 0.1 : 0.1} />
      <div className="relative mx-auto" style={{ maxWidth: 1180 }}>
        {hasAnchor ? (
          <div className={`grid items-center gap-x-16 gap-y-10 ${cols}`}>
            {content}
            {composition}
          </div>
        ) : (
          <div style={{ maxWidth: 820 }}>{content}</div>
        )}
      </div>
    </section>
  )
}
