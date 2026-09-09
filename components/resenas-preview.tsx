"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { ResenaCard } from "@/components/resena-card"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"
import { fsProps, type FieldScaleMap } from "@/lib/text-size"
import { fallbacksFor } from "@/lib/resenas-schema"
import type { PublicTestimonial } from "@/lib/testimonials"

/**
 * Adelanto de reseñas para el home y /servicios. Recibe las publicadas por
 * props: el fetch lo hace el server component de cada página, nunca este
 * componente.
 *
 * `bg` ajusta el fondo según dónde se inserte, igual que <Conexiones>, para no
 * romper la alternancia hueso / hueso-oscuro / arena de cada página.
 */

/** Con una sola reseña el bloque se ve pobre; con ninguna, vacío. */
const MIN_PARA_MOSTRAR = 2

/**
 * Las 3 a mostrar, siempre por published_at desc (nunca por rating).
 *
 * ÚNICA excepción: si hay alguna reseña de periodista publicada pero ninguna
 * entra en las 3 más recientes, la de periodista más reciente ocupa el tercer
 * lugar. Es la que más aporta acá, porque respalda la promesa de "relaciones
 * reales con periodistas" que hace el hero.
 */
export function pickPreview(resenas: PublicTestimonial[]): PublicTestimonial[] {
  const top = resenas.slice(0, 3)

  if (top.some((r) => r.reviewer_type === "periodista")) return top

  const periodista = resenas.find((r) => r.reviewer_type === "periodista")
  if (!periodista || top.length < 3) return top

  return [...top.slice(0, 2), periodista]
}

export function ResenasPreview({
  resenas,
  content,
  scales,
  bg = "bg-hueso",
}: {
  /** Publicadas, ya ordenadas por published_at desc. */
  resenas: PublicTestimonial[]
  content?: Record<string, string>
  scales?: FieldScaleMap
  bg?: string
}) {
  if (resenas.length < MIN_PARA_MOSTRAR) return null

  const c = { ...fallbacksFor("preview"), ...content }
  const visibles = pickPreview(resenas)

  return (
    <section className={`${bg} py-20 lg:py-28`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* ── Encabezado ── */}
        <motion.header
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-center text-center"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo"
            {...fsProps(scales, "preview", "eyebrow", {
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "0.2em",
            })}
          >
            {c.eyebrow}
          </motion.p>

          <motion.span
            variants={fadeUp}
            aria-hidden
            className="my-6 h-px bg-dorado"
            style={{ width: 40 }}
          />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo"
            {...fsProps(scales, "preview", "title_pre", {
              fontSize: "var(--fs-h2)",
              lineHeight: "var(--lh-tight)",
              letterSpacing: "-0.02em",
              maxWidth: "22ch",
            })}
          >
            {c.title_pre} <em className="italic text-bordo">{c.title_accent}</em>{" "}
            {c.title_post}
          </motion.h2>
        </motion.header>

        {/* ── Tarjetas ── */}
        <motion.ul
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visibles.map((r) => (
            <motion.li key={r.id} variants={fadeUp} className="h-full">
              <ResenaCard resena={r} />
            </motion.li>
          ))}
        </motion.ul>

        {/* ── Link a la página completa ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/resenas"
            className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-bordo/40 px-5 py-2.5 font-sans font-semibold text-bordo transition-all duration-300 hover:border-bordo hover:bg-bordo hover:text-hueso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
            style={{ fontSize: "var(--fs-caption)" }}
          >
            {c.cta_label}
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
