"use client"

import { motion, type Variants } from "motion/react"
import Link from "next/link"
import { EASE_EXPO } from "@/lib/animations"
import { fallbacksFor } from "@/lib/servicios-schema"
import { ServiceFeatureCard } from "@/components/servicios/service-feature-card"
import { fsStyle, type FieldScaleMap } from "@/lib/text-size"

/**
 * Vidriera de servicios del HOME — ESPEJO RESUMIDO de /servicios.
 *
 * Consume los MISMOS 4 servicios (servicio_01…04 de la página «servicios»),
 * mostrando solo eyebrow + título + primer párrafo del intro de cada uno.
 * Comparte el lenguaje visual de /servicios (ServiceFeatureCard + línea dorada,
 * sin numerales — la jerarquía es por diseño). Cada card enlaza al bloque
 * completo en /servicios#servicio-{n}. Si Marian edita un servicio desde
 * /admin/edit/servicios, el cambio se refleja acá y en /servicios sin tocar
 * código (misma fuente content_blocks + revalidatePath en ambas rutas).
 *
 * Fallback robusto: se mergea con los fallbacks del esquema de servicios, así
 * que si Supabase está vacío la sección se ve idéntica.
 */

const VIEWPORT = { once: true, amount: 0.2 } as const

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } },
}

/** Primer párrafo de un intro multi-párrafo (separados por línea en blanco). */
function firstParagraph(raw?: string): string {
  return (
    (raw ?? "")
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .find(Boolean) ?? ""
  )
}

type ServicioCard = { section: string; anchor: string; eyebrow: string; title: string; desc: string }

export function HomeServicios({
  servicios,
  ctaLabel,
  scales,
}: {
  servicios?: Record<string, Record<string, string>>
  ctaLabel?: string
  /**
   * Tamaños/fuentes de la página «servicios» (no del home): estas cards son un
   * espejo de /servicios, así que comparten el mismo campo editable y el mismo
   * ajuste de apariencia. Marian lo toca una vez y se ve igual en los dos lados.
   */
  scales?: FieldScaleMap
}) {
  const cards: ServicioCard[] = [1, 2, 3, 4].map((n) => {
    const key = `servicio_0${n}`
    const c = { ...fallbacksFor(key), ...servicios?.[key] }
    return {
      section: key,
      anchor: `servicio-${n}`,
      eyebrow: (c.eyebrow ?? "").trim(),
      title: (c.title ?? "").trim(),
      desc: firstParagraph(c.intro),
    }
  })
  const cta = (ctaLabel ?? "Ver servicios en detalle").trim()

  return (
    <section id="servicios" className="bg-hueso pt-24 lg:pt-[140px] pb-20 lg:pb-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex flex-col gap-8"
        >

          {/* ── GRID 2x2 (mobile: 1 columna) — mismas cards que /servicios ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {cards.map((s) => (
              <motion.div key={s.anchor} variants={itemVariants}>
                <Link href={`/servicios#${s.anchor}`} className="group block h-full">
                  <ServiceFeatureCard className="flex h-full flex-col">
                    <span aria-hidden className="mb-5 h-px w-8 bg-dorado" />
                    {s.eyebrow && (
                      <p
                        className="font-mono uppercase text-bordo"
                        {...fsStyle(scales?.[`${s.section}.eyebrow`], { fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em", marginBottom: 10 }, `${s.section}.eyebrow`)}
                      >
                        {s.eyebrow}
                      </p>
                    )}
                    <h3
                      className="font-playfair font-bold text-negro-bordo"
                      {...fsStyle(scales?.[`${s.section}.title`], { fontSize: "var(--fs-lead)", lineHeight: "var(--lh-snug)" }, `${s.section}.title`)}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="font-sans text-gris-bordo"
                      {...fsStyle(scales?.[`${s.section}.intro`], { fontSize: "var(--fs-body)", lineHeight: "var(--lh-base)", marginTop: 16 }, `${s.section}.intro`)}
                    >
                      {s.desc}
                    </p>
                    <span
                      className="mt-6 inline-flex items-center gap-2 font-mono uppercase text-bordo"
                      style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.16em" }}
                    >
                      Ver más
                      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </ServiceFeatureCard>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ── CTA: ver todos los servicios ── */}
          <motion.div variants={itemVariants} className="flex justify-center pt-2">
            <Link
              href="/servicios"
              className="group inline-flex items-center gap-2 rounded-full bg-bordo px-8 py-4 font-sans font-semibold text-hueso transition-all hover:bg-bordo/90 active:scale-[0.98]"
              style={{ fontSize: "var(--fs-body)" }}
            >
              {cta}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
