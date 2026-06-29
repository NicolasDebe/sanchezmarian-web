"use client"

import { motion, type Variants } from "motion/react"
import Link from "next/link"
import { EASE_EXPO } from "@/lib/animations"
import { fallbacksFor } from "@/lib/home-schema"

/**
 * Sección de servicios del HOME — jerarquía 1+3: un servicio DESTACADO en una
 * card full-width arriba y los otros tres en una grilla de 3 columnas (apilada
 * en mobile). Tipografía aplanada: solo el título resalta (Playfair); todas las
 * descripciones comparten el mismo tamaño, peso y color (DM Sans 15px regular,
 * --gris-bordo), sin cursivas, negritas ni bordó inline.
 *
 * Contenido editable desde /admin/edit/home → sección «Servicios». Fallback
 * robusto: si Supabase está vacío, se mergea con los fallbacks del esquema y la
 * sección se ve idéntica (los textos son palabra por palabra los del brief).
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

/** Estilo único de descripción — mismo para destacada y no destacadas. */
const DESC_STYLE = {
  fontSize: 15,
  lineHeight: 1.6,
  fontWeight: 400,
  marginTop: 16,
} as const

export function HomeServicios({ section }: { section?: Record<string, string> }) {
  const c = { ...fallbacksFor("servicios"), ...section }

  const secondary = [
    { num: "02", title: c.s2_title, desc: c.s2_desc },
    { num: "03", title: c.s3_title, desc: c.s3_desc },
    { num: "04", title: c.s4_title, desc: c.s4_desc },
  ]

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

          {/* ── CARD DESTACADA (servicio 1, full-width) ── */}
          <motion.article
            variants={itemVariants}
            className="rounded-[20px] border border-dorado/30 bg-hueso-oscuro p-8 sm:p-10"
          >
            <p
              className="font-mono text-bordo/50"
              style={{ fontSize: 11, letterSpacing: "0.12em", marginBottom: 16 }}
            >
              01
            </p>
            <h3
              className="font-playfair font-bold text-negro-bordo"
              style={{ fontSize: "clamp(28px, 3vw, 32px)", lineHeight: 1.15, maxWidth: "22ch" }}
            >
              {c.featured_title}
            </h3>
            <p className="font-sans text-gris-bordo" style={{ ...DESC_STYLE, maxWidth: "62ch" }}>
              {c.featured_desc}
            </p>
          </motion.article>

          {/* ── GRID 3 COLUMNAS (servicios 2, 3, 4) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondary.map((s) => (
              <motion.article
                key={s.num}
                variants={itemVariants}
                className="flex flex-col rounded-[20px] border border-dorado/20 bg-arena p-6 sm:p-7"
              >
                <p
                  className="font-mono text-bordo/50"
                  style={{ fontSize: 11, letterSpacing: "0.12em", marginBottom: 14 }}
                >
                  {s.num}
                </p>
                <h3
                  className="font-playfair font-bold text-negro-bordo"
                  style={{ fontSize: 22, lineHeight: 1.2 }}
                >
                  {s.title}
                </h3>
                <p className="font-sans text-gris-bordo" style={DESC_STYLE}>
                  {s.desc}
                </p>
              </motion.article>
            ))}
          </div>

          {/* ── CTA: ver todos los servicios ── */}
          <motion.div variants={itemVariants} className="flex justify-center pt-2">
            <Link
              href="/servicios"
              className="group inline-flex items-center gap-2 rounded-full bg-bordo px-8 py-4 font-sans text-[15px] font-semibold text-hueso transition-all hover:bg-bordo/90 active:scale-[0.98]"
            >
              {c.cta_label}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
