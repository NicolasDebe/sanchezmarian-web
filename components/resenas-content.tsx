"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { ResenaCard } from "@/components/resena-card"
import { StarRating } from "@/components/star-rating"
import { RichText } from "@/components/ui/RichText"
import { fadeUp, fadeUpStagger, springSnappy, tapScale, viewportOnce } from "@/lib/animations"
import { fsProps, type FieldScaleMap } from "@/lib/text-size"
import { fallbacksFor } from "@/lib/resenas-schema"
import type { PublicTestimonial, RatingSummary, ReviewerType } from "@/lib/testimonials"

/**
 * Contenido de /resenas. Recibe TODO por props: el fetch vive en el server
 * component de la página.
 *
 * Dos reglas duras que evitan que la página se vea pobre al principio:
 *  - el promedio solo aparece con 5 reseñas o más (con menos no significa nada)
 *  - los chips de filtro, con 8 o más Y al menos 2 de cada tipo (si no, un
 *    filtro puede devolver una sola tarjeta)
 * Una sola lista mezclada por published_at desc: partirla en dos bloques daría
 * dos secciones casi vacías.
 *
 * Sin AggregateRating de schema.org a propósito: Google no muestra estrellas en
 * los resultados para reseñas que una organización aloja sobre sí misma, así
 * que no aporta SEO y se puede leer como marcado engañoso.
 */

const MIN_PARA_PROMEDIO = 5
const MIN_PARA_CHIPS = 8
const MIN_POR_TIPO_PARA_CHIPS = 2

type Filtro = "todas" | ReviewerType

export function ResenasContent({
  resenas,
  summary,
  content,
  scales,
}: {
  resenas: PublicTestimonial[]
  summary: RatingSummary
  content?: {
    hero?: Record<string, string>
    empty?: Record<string, string>
  }
  scales?: FieldScaleMap
}) {
  const c = { ...fallbacksFor("hero"), ...content?.hero }
  const empty = { ...fallbacksFor("empty"), ...content?.empty }

  const [filtro, setFiltro] = useState<Filtro>("todas")

  const mostrarPromedio =
    summary.average !== null && summary.count >= MIN_PARA_PROMEDIO

  const mostrarChips =
    resenas.length >= MIN_PARA_CHIPS &&
    summary.countMarcas >= MIN_POR_TIPO_PARA_CHIPS &&
    summary.countPeriodistas >= MIN_POR_TIPO_PARA_CHIPS

  const visibles = useMemo(
    () =>
      filtro === "todas"
        ? resenas
        : resenas.filter((r) => r.reviewer_type === filtro),
    [resenas, filtro],
  )

  const chips: { key: Filtro; label: string; count: number }[] = [
    { key: "todas", label: "Todas", count: resenas.length },
    { key: "marca", label: "Marcas", count: summary.countMarcas },
    { key: "periodista", label: "Periodistas", count: summary.countPeriodistas },
  ]

  return (
    <section className="bg-hueso" style={{ padding: "clamp(56px, 9vh, 96px) 0 clamp(72px, 11vh, 120px)" }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-12">

        {/* ── Encabezado ── */}
        <motion.header
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo"
            {...fsProps(scales, "hero", "eyebrow", {
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "0.2em",
            })}
          >
            {c.eyebrow}
          </motion.p>

          <motion.span
            variants={fadeUp}
            aria-hidden
            className="my-6 block h-px bg-dorado"
            style={{ width: 40 }}
          />

          <motion.h1
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo"
            {...fsProps(scales, "hero", "title_pre", {
              fontSize: "var(--fs-h1)",
              lineHeight: "1.12",
              letterSpacing: "-0.02em",
            })}
          >
            {c.title_pre} <em className="italic text-bordo">{c.title_accent}</em>{" "}
            {c.title_post}
          </motion.h1>

          {c.subtitle && (
            <motion.div variants={fadeUp}>
              <RichText
                html={c.subtitle}
                className="rich-inline mt-5 max-w-[54ch] font-sans leading-relaxed text-gris-bordo"
                style={{ fontSize: "var(--fs-body-lg)" }}
                scale={scales?.["hero.subtitle"]}
                fkey="hero.subtitle"
              />
            </motion.div>
          )}
        </motion.header>

        {/* ── Promedio (solo con 5 o más) ── */}
        {mostrarPromedio && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 flex flex-col gap-2 border-t border-gris-bordo/12 pt-8"
          >
            <div className="flex items-center gap-4">
              <span
                className="font-playfair font-bold leading-none text-bordo"
                style={{ fontSize: "calc(clamp(2.6rem, 6vw, 4rem) * var(--text-scale))" }}
              >
                {/* toFixed(1) para que un 5 entero se lea "5,0" y no salte de ancho */}
                {summary.average!.toFixed(1).replace(".", ",")}
              </span>
              <StarRating rating={summary.average!} size={22} />
            </div>
            <p className="font-mono uppercase tracking-[0.14em] text-gris-bordo/70 text-[length:var(--fs-micro)]">
              Promedio sobre {summary.count} reseñas
            </p>
          </motion.div>
        )}

        {/* ── Filtro (solo con 8 o más y al menos 2 de cada tipo) ── */}
        {mostrarChips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            role="group"
            aria-label="Filtrar reseñas por tipo"
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {chips.map((chip) => {
              const activo = filtro === chip.key
              return (
                <motion.button
                  key={chip.key}
                  type="button"
                  onClick={() => setFiltro(chip.key)}
                  aria-pressed={activo}
                  whileTap={{ scale: tapScale }}
                  transition={springSnappy}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo ${
                    activo
                      ? "border-bordo bg-bordo text-hueso"
                      : "border-bordo/35 text-bordo hover:bg-bordo/8"
                  }`}
                  style={{ fontSize: "var(--fs-caption)" }}
                >
                  {chip.label}
                  <span
                    className={`font-mono tabular-nums ${activo ? "text-hueso/65" : "text-bordo/55"}`}
                    style={{ fontSize: "var(--fs-micro)" }}
                  >
                    {chip.count}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* ── Lista o estado vacío ── */}
        {resenas.length === 0 ? (
          <EmptyState copy={empty} />
        ) : (
          <motion.ul
            // key por filtro: al cambiar de chip la lista se remonta y vuelve a
            // entrar escalonada, en vez de reordenarse sin transición.
            key={filtro}
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {visibles.map((r) => (
              <motion.li key={r.id} variants={fadeUp} className="h-full">
                <ResenaCard resena={r} />
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* ── Recuadro del pie ── */}
        {c.footer_note && (
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5 }}
            className="mt-14 rounded-2xl border border-gris-bordo/10 bg-hueso-oscuro px-6 py-6 sm:px-8"
          >
            <p
              className="max-w-[70ch] font-sans leading-relaxed text-gris-bordo"
              style={{ fontSize: "var(--fs-caption)" }}
            >
              {c.footer_note}
            </p>
          </motion.aside>
        )}
      </div>
    </section>
  )
}

// ─── Estado vacío ────────────────────────────────────────────────────────────

function EmptyState({ copy }: { copy: Record<string, string> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12 rounded-2xl border border-gris-bordo/12 bg-arena px-6 py-12 text-center sm:px-10 sm:py-16"
    >
      <span aria-hidden className="mx-auto mb-6 block h-px w-10 bg-dorado" />

      <h2
        className="font-playfair text-negro-bordo"
        style={{ fontSize: "var(--fs-h3)" }}
      >
        {copy.title}
      </h2>

      <p
        className="mx-auto mt-3 max-w-[46ch] font-sans leading-relaxed text-gris-bordo"
        style={{ fontSize: "var(--fs-body)" }}
      >
        {copy.body}
      </p>

      <Link
        href="/resenas/nueva"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-bordo px-7 py-3.5 font-sans font-semibold text-hueso transition-colors hover:bg-bordo-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
        style={{ fontSize: "var(--fs-body)" }}
      >
        {copy.cta_label}
        <ArrowRight size={16} strokeWidth={2.5} />
      </Link>
    </motion.div>
  )
}
