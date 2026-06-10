"use client"

import { Fragment } from "react"
import { motion } from "motion/react"
import type { Variants } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { fallbacksFor } from "@/lib/servicios-schema"

const subStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

/* ─── esquemas de color ─────────────────────────────────────────── */
type Scheme = {
  watermarkClass: string
  watermarkOpacity: number
  nombreClass: string
  taglineClass: string
  descClass: string
  labelClass: string
  labelOpacity: number
  indicadorClass: string
  subTituloClass: string
  subDescClass: string
  btnClass: string
}

const LIGHT: Scheme = {
  watermarkClass:  "text-bordo",
  watermarkOpacity: 0.1,
  nombreClass:     "text-negro-bordo",
  taglineClass:    "text-bordo",
  descClass:       "text-gris-bordo",
  labelClass:      "text-bordo",
  labelOpacity:    0.6,
  indicadorClass:  "bg-bordo",
  subTituloClass:  "text-negro-bordo",
  subDescClass:    "text-gris-bordo",
  btnClass:        "bg-bordo text-hueso hover:bg-bordo-oscuro",
}

const DARK: Scheme = {
  watermarkClass:  "text-hueso",
  watermarkOpacity: 0.08,
  nombreClass:     "text-hueso",
  taglineClass:    "text-hueso/70",
  descClass:       "text-hueso/85",
  labelClass:      "text-dorado",
  labelOpacity:    1,
  indicadorClass:  "bg-dorado",
  subTituloClass:  "text-hueso",
  subDescClass:    "text-hueso/75",
  btnClass:        "bg-hueso text-bordo hover:bg-arena",
}

/* ─── tipos ─────────────────────────────────────────────────────── */
type Servicio = {
  id: string
  num: string
  nombre: string
  tagline: string
  descripcion: string
  subServicios: { titulo: string; desc: string }[]
  cta: string
  bg: string
  dark: boolean
}

function buildServicio(
  id: string,
  c: Record<string, string>,
  bg: string,
  dark: boolean,
): Servicio {
  const subServicios = [1, 2, 3]
    .map((n) => ({ titulo: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((s) => s.titulo.trim() !== "")
  return {
    id,
    num: c.number,
    nombre: c.name,
    tagline: c.tagline,
    descripcion: c.description,
    subServicios,
    cta: c.cta_text,
    bg,
    dark,
  }
}

/* ─── hero ──────────────────────────────────────────────────────── */
function HeroServicios({ c }: { c: Record<string, string> }) {
  return (
    <section
      className="relative bg-hueso overflow-hidden"
      style={{ paddingTop: 140, paddingBottom: 100 }}
    >
      <TextureOverlay texture="paperGrain" opacity={0.2} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
          style={{ maxWidth: 720 }}
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo"
            style={{ fontSize: 11, letterSpacing: "0.15em" }}
          >
            {c.eyebrow}
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado" />

          <motion.h1
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.15 }}
          >
            {c.h1}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            {c.description}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── servicio individual ───────────────────────────────────────── */
function ServicioSection({ s }: { s: Servicio }) {
  const c = s.dark ? DARK : LIGHT

  return (
    <section id={s.id} className={`${s.bg} py-[120px] overflow-hidden`}>
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative flex flex-col"
        >
          <span
            className={`hidden md:block absolute font-playfair italic ${c.watermarkClass} select-none pointer-events-none leading-none`}
            style={{ fontSize: 120, opacity: c.watermarkOpacity, top: -20, right: 0 }}
            aria-hidden
          >
            {s.num}
          </span>

          <motion.h2
            variants={fadeUp}
            className={`font-playfair font-bold ${c.nombreClass} relative z-10 mb-3`}
            style={{ fontSize: 36, lineHeight: 1.1 }}
          >
            {s.nombre}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className={`font-playfair italic ${c.taglineClass} relative z-10 mb-6`}
            style={{ fontSize: 18 }}
          >
            {s.tagline}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className={`font-sans ${c.descClass} relative z-10 mb-12`}
            style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 680 }}
          >
            {s.descripcion}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className={`font-mono uppercase ${c.labelClass} relative z-10 mb-5`}
            style={{ fontSize: 11, letterSpacing: "0.15em", opacity: c.labelOpacity }}
          >
            Sub-servicios:
          </motion.p>

          <motion.ul
            variants={subStagger}
            className="flex flex-col relative z-10"
            style={{ gap: 20 }}
          >
            {s.subServicios.map((sub, i) => (
              <motion.li key={i} variants={fadeUp} className="flex items-start gap-4">
                <span
                  className={`shrink-0 rounded-full ${c.indicadorClass}`}
                  style={{ width: 2, height: 20, marginTop: 4 }}
                />
                <div>
                  <p
                    className={`font-sans font-semibold ${c.subTituloClass}`}
                    style={{ fontSize: 15, lineHeight: 1.5 }}
                  >
                    {sub.titulo}
                  </p>
                  {sub.desc && (
                    <p
                      className={`font-sans ${c.subDescClass} mt-1`}
                      style={{ fontSize: 14, lineHeight: 1.7 }}
                    >
                      {sub.desc}
                    </p>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} className="relative z-10 mt-10">
            <Link
              href="/#contacto"
              className={`inline-flex items-center font-sans font-semibold rounded-lg active:scale-[0.98] transition-all duration-200 ${c.btnClass}`}
              style={{ fontSize: 14, paddingInline: 28, paddingBlock: 14 }}
            >
              {s.cta}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── export ────────────────────────────────────────────────────── */
export function ServiciosPageSections({
  content,
}: {
  content?: {
    hero?: Record<string, string>
    servicio_01?: Record<string, string>
    servicio_02?: Record<string, string>
    servicio_03?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const servicios: Servicio[] = [
    buildServicio("servicio-01", { ...fallbacksFor("servicio_01"), ...content?.servicio_01 }, "bg-hueso", false),
    buildServicio("servicio-02", { ...fallbacksFor("servicio_02"), ...content?.servicio_02 }, "bg-bordo", true),
    buildServicio("servicio-03", { ...fallbacksFor("servicio_03"), ...content?.servicio_03 }, "bg-hueso", false),
  ]

  return (
    <>
      <HeroServicios c={hero} />
      {servicios.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && (
            <div className="w-full bg-bordo/15" style={{ height: 1 }} aria-hidden />
          )}
          <ServicioSection s={s} />
        </Fragment>
      ))}
    </>
  )
}
