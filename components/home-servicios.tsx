"use client"

import { motion, type Variants } from "motion/react"
import Link from "next/link"
import { EASE_EXPO } from "@/lib/animations"
import { htmlToPlainText } from "@/lib/rich-text"
import { fallbacksFor as homeFallbacks } from "@/lib/home-schema"
import { fallbacksFor as svcFallbacks } from "@/lib/servicios-schema"

/**
 * Sección de servicios del HOME — vidriera condensada que espeja la jerarquía
 * de /servicios: Mentoría como servicio PRINCIPAL (card grande, --bordo) y
 * Prensa (--arena) + RRPP (--bordo) como secundarios.
 *
 * REGLA: NO duplica contenido. Los títulos, frases ancla, sub-servicios y
 * descripciones se LEEN de content_blocks (page='servicios'); acá llegan como
 * props desde el server component. El marco (encabezado, pie, texto del link)
 * se edita desde home.servicios. Fallback robusto: si faltan props, se mergea
 * con los fallbacks de cada esquema y la sección se ve igual.
 */

const VIEWPORT = { once: true, amount: 0.2 } as const

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } },
}

/**
 * Versión condensada de una descripción: corta en la primera frontera de
 * oración dentro del límite (no inventa una versión corta). Si no hay un punto
 * razonable antes del límite, corta por palabra con elipsis.
 */
function condense(html: string, maxLen = 200): string {
  const plain = htmlToPlainText(html ?? "").trim()
  if (plain.length <= maxLen) return plain
  const slice = plain.slice(0, maxLen)
  const lastDot = slice.lastIndexOf(".")
  if (lastDot >= 80) return slice.slice(0, lastDot + 1)
  const lastSpace = slice.lastIndexOf(" ")
  return slice.slice(0, lastSpace > 0 ? lastSpace : maxLen).trimEnd() + "…"
}

/** Devuelve hasta 3 títulos de sub-servicio no vacíos. */
function subTitles(c: Record<string, string>): string[] {
  return [c.sub_1_title, c.sub_2_title, c.sub_3_title]
    .map((t) => (t ?? "").trim())
    .filter(Boolean)
    .slice(0, 3)
}

type ServicioContent = Record<string, string>

export function HomeServicios({
  section,
  mentoria: mentoriaContent,
  prensa: prensaContent,
  rrpp: rrppContent,
}: {
  section?: Record<string, string>
  mentoria?: ServicioContent
  prensa?: ServicioContent
  rrpp?: ServicioContent
}) {
  const sec = { ...homeFallbacks("servicios"), ...section }
  const mentoria = { ...svcFallbacks("servicio_02"), ...mentoriaContent }
  const prensa = { ...svcFallbacks("servicio_01"), ...prensaContent }
  const rrpp = { ...svcFallbacks("servicio_03"), ...rrppContent }

  const ctaLabel = sec.card_cta_label || "Conocer este servicio"

  return (
    <section id="servicios" className="bg-hueso py-20 lg:py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Encabezado de sección ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mb-14 lg:mb-16"
        >
          <motion.p
            variants={itemVariants}
            className="font-mono uppercase text-bordo mb-4"
            style={{ fontSize: 11, letterSpacing: "0.15em" }}
          >
            {sec.eyebrow}
          </motion.p>

          <motion.div variants={itemVariants} className="w-10 h-px bg-dorado mb-6" />

          <motion.h2
            variants={itemVariants}
            className="font-playfair font-bold text-negro-bordo leading-[1.1] mb-5"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)", maxWidth: 760 }}
          >
            {sec.title_pre}{" "}
            <em className="font-playfair italic text-bordo">{sec.title_accent}</em>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 640 }}
          >
            {sec.subtitle}
          </motion.p>
        </motion.div>

        {/* ── Bento grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >

          {/* ── CARD MENTORÍA (principal, --bordo, col-span-2) ── */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 flex flex-col rounded-[20px] bg-bordo p-8 lg:p-14"
            style={{ minHeight: 380 }}
          >
            <p
              className="font-mono uppercase text-hueso/60 mb-6"
              style={{ fontSize: 11, letterSpacing: "0.12em" }}
            >
              <span className="text-dorado" style={{ marginRight: 8 }}>●</span>
              Servicio principal
            </p>

            <h3
              className="font-playfair font-bold text-hueso mb-5"
              style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: 1.1, maxWidth: "20ch" }}
            >
              {mentoria.name}
            </h3>

            {mentoria.tagline && (
              <p
                className="font-playfair italic text-dorado mb-6"
                style={{ fontSize: "clamp(16px, 1.5vw, 20px)", lineHeight: 1.4, maxWidth: "44ch" }}
              >
                <span aria-hidden="true" className="text-dorado/50" style={{ fontSize: 28, marginRight: 4 }}>
                  “
                </span>
                {mentoria.tagline}
              </p>
            )}

            <p
              className="font-sans text-hueso/85 mb-8"
              style={{ fontSize: 14, lineHeight: 1.6, maxWidth: "60ch" }}
            >
              {condense(mentoria.description)}
            </p>

            <ul className="mb-8 flex flex-col">
              {subTitles(mentoria).map((title, i) => (
                <li
                  key={title}
                  className="flex items-center gap-2"
                  style={{
                    paddingBlock: 12,
                    ...(i > 0 ? { borderTop: "1px solid rgba(254,252,239,0.15)" } : {}),
                  }}
                >
                  <span aria-hidden="true" className="text-dorado" style={{ fontSize: 14 }}>·</span>
                  <span className="font-sans font-medium text-hueso" style={{ fontSize: 13 }}>
                    {title}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/servicios"
              className="group mt-auto inline-flex w-fit items-center gap-1.5 font-sans font-semibold text-hueso underline underline-offset-4"
              style={{ fontSize: 13 }}
            >
              {ctaLabel}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* ── CARD PRENSA (--arena, col-span-1) ── */}
          <SecondaryCard
            variant="light"
            badge="Servicio 02"
            c={prensa}
            ctaLabel={ctaLabel}
          />

          {/* ── CARD RRPP (--bordo, col-span-1) ── */}
          <SecondaryCard
            variant="dark"
            badge="Servicio 03"
            c={rrpp}
            ctaLabel={ctaLabel}
          />

        </motion.div>

        {/* ── Pie: link a /servicios ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.1 }}
          className="mt-12 flex flex-col items-center gap-2 text-center"
        >
          <p className="font-sans text-gris-bordo" style={{ fontSize: 14 }}>
            {sec.footer_link_pre}
          </p>
          <Link
            href="/servicios"
            className="inline-flex items-center gap-1.5 font-sans font-semibold text-bordo underline underline-offset-4 transition-colors hover:text-bordo-oscuro"
            style={{ fontSize: 14 }}
          >
            {sec.footer_link_label}
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}

/**
 * Card secundaria (Prensa = light/--arena, RRPP = dark/--bordo). Misma
 * estructura; el tratamiento cromático cambia según `variant`.
 */
function SecondaryCard({
  variant,
  badge,
  c,
  ctaLabel,
}: {
  variant: "light" | "dark"
  badge: string
  c: ServicioContent
  ctaLabel: string
}) {
  const dark = variant === "dark"
  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={[
        "group flex flex-col rounded-[20px] p-8 lg:p-12 transition-shadow duration-[250ms] ease-out",
        dark
          ? "bg-bordo hover:shadow-[0_8px_32px_rgba(26,0,8,0.15)]"
          : "bg-arena hover:shadow-[0_8px_32px_rgba(102,0,31,0.08)]",
      ].join(" ")}
      style={{ minHeight: 420 }}
    >
      <p
        className={`font-mono uppercase mb-5 ${dark ? "text-hueso/60" : "text-bordo"}`}
        style={{ fontSize: 10, letterSpacing: "0.16em" }}
      >
        <span className="text-dorado" style={{ marginRight: 6 }}>●</span>
        {badge}
      </p>

      <h3
        className={`font-playfair font-bold ${dark ? "text-hueso" : "text-negro-bordo"}`}
        style={{ fontSize: 26, lineHeight: 1.15 }}
      >
        {c.name}
      </h3>

      {c.tagline && (
        <p
          className={`font-playfair italic ${dark ? "text-dorado" : "text-bordo"}`}
          style={{ fontSize: 16, lineHeight: 1.4, margin: "20px 0" }}
        >
          <span aria-hidden="true" className={dark ? "text-dorado/50" : "text-dorado/40"} style={{ fontSize: 24, marginRight: 2 }}>
            “
          </span>
          {c.tagline}
        </p>
      )}

      <p
        className={`font-sans ${dark ? "text-hueso/75" : "text-gris-bordo"}`}
        style={{ fontSize: 14, lineHeight: 1.65 }}
      >
        {condense(c.description)}
      </p>

      <ul className="mt-7 flex flex-col">
        {subTitles(c).map((title, i) => (
          <li
            key={title}
            className="flex items-center gap-2"
            style={{
              paddingBlock: 10,
              ...(i > 0
                ? { borderTop: dark ? "1px solid rgba(254,252,239,0.12)" : "1px solid rgba(201,168,130,0.25)" }
                : {}),
            }}
          >
            <span aria-hidden="true" className="text-dorado" style={{ fontSize: 14 }}>·</span>
            <span
              className={`font-sans font-medium ${dark ? "text-hueso" : "text-negro-bordo"}`}
              style={{ fontSize: 13 }}
            >
              {title}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/servicios"
        className={`mt-auto inline-flex w-fit items-center gap-1.5 font-sans font-semibold underline underline-offset-4 ${dark ? "text-hueso" : "text-bordo"}`}
        style={{ fontSize: 13, paddingTop: 24 }}
      >
        {ctaLabel}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </motion.article>
  )
}
