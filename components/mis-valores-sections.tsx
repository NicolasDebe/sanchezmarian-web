"use client"

import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import {
  fadeUp, fadeLeft,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"
import { fallbacksFor } from "@/lib/mis-valores-schema"
import { RichText } from "@/components/ui/RichText"
import { fsStyle, type FieldScaleMap } from "@/lib/text-size"
import { HeroWords, heroNextLineDelay, heroSatelliteDelay, useHeroSatellite } from "@/components/ui/hero-reveal"
import heroValores from "@/public/images/NAC_4208.jpg"

/* ═══════════════════════════════════════════════════════════════
   HERO EDITORIAL — título palabra por palabra + satélites
   (coreografía compartida en components/ui/hero-reveal.tsx)
═══════════════════════════════════════════════════════════════ */
function HeroEditorial({ c, scales }: { c: Record<string, string>; scales?: FieldScaleMap }) {
  const satellite = useHeroSatellite(heroSatelliteDelay(c.h1_pre, c.h1_accent))

  return (
    <section style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      <Image
        src={heroValores}
        alt="Marian Sánchez en su espacio de trabajo"
        preload
        placeholder="blur"
        sizes="100vw"
        className="max-h-[70vh] sm:max-h-[90vh]"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div
        className="pt-5 sm:pt-0 px-5 sm:px-[clamp(20px,5vw,64px)] pb-8 sm:pb-[clamp(32px,6vh,64px)]"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <div>

          <motion.p
            {...satellite(0)}
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "rgba(254,252,239,0.65)",
              marginBottom: "14px",
            }}
          >
            {c.eyebrow}
          </motion.p>

          <h1
            aria-label={`${c.h1_pre} ${c.h1_accent}`}
            {...fsStyle(scales?.["hero.h1_pre"], {
              fontFamily: "Playfair Display, serif",
              color: "#FEFCEF",
              fontWeight: 700,
              margin: 0,
            }, "hero.h1_pre")}
          >
            <HeroWords
              text={c.h1_pre}
              as="span"
              ariaHidden
              style={{ display: "block", fontSize: "calc(clamp(1.3rem, 3vw, 2.2rem) * var(--text-scale))", fontWeight: 600, opacity: 0.88 }}
            />
            <HeroWords
              text={c.h1_accent}
              as="em"
              ariaHidden
              delay={heroNextLineDelay(c.h1_pre)}
              style={{ display: "block", fontSize: "calc(clamp(2rem, 5vw, 4rem) * var(--text-scale))", fontStyle: "italic", lineHeight: "var(--lh-tight)" }}
            />
          </h1>

        </div>
      </div>

    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BIO — 3 párrafos
═══════════════════════════════════════════════════════════════ */
function BioSection({ c, scales }: { c: Record<string, string>; scales?: FieldScaleMap }) {
  return (
    <section className="bg-hueso py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-[760px] flex flex-col gap-8">
          <motion.p
            className="font-playfair font-bold text-negro-bordo text-[calc(28px*var(--text-scale))] sm:text-[calc(32px*var(--text-scale))] lg:text-[calc(36px*var(--text-scale))] leading-[1.3]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            {...fsStyle(scales?.["bio.paragraph_1_pre"], undefined, "bio.paragraph_1_pre")}
          >
            {c.paragraph_1_pre}{" "}{c.paragraph_1_accent}
          </motion.p>

          <motion.div
            className="font-sans text-gris-bordo leading-[1.7]"
            {...fsStyle(scales?.["bio.paragraph_2"], { fontSize: "var(--fs-body-lg)" }, "bio.paragraph_2")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <RichText html={c.paragraph_2} className="rich-inline" />
          </motion.div>

          <motion.div
            className="font-sans text-gris-bordo leading-[1.7]"
            {...fsStyle(scales?.["bio.paragraph_3"], { fontSize: "var(--fs-body-lg)" }, "bio.paragraph_3")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <RichText html={c.paragraph_3} className="rich-inline" />
          </motion.div>

          <motion.p
            className="font-mono text-gris-bordo/60 mt-2 text-right"
            style={{ fontSize: "var(--fs-eyebrow)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {c.signature}
          </motion.p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PILARES
═══════════════════════════════════════════════════════════════ */
function PilaresSection({ c, scales }: { c: Record<string, string>; scales?: FieldScaleMap }) {
  const pilares = [1, 2, 3, 4, 5].map((n) => ({
    n,
    num: String(n).padStart(2, "0"),
    titulo: c[`pilar_${n}_title`] ?? "",
    descripcion: c[`pilar_${n}_desc`] ?? "",
  }))

  return (
    <section className="bg-hueso-oscuro py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16"
        >
          <motion.p variants={fadeUp} className="font-mono uppercase tracking-[0.25em] text-bordo mb-4" style={{ fontSize: "var(--fs-micro)" }}>
            {c.eyebrow}
          </motion.p>
          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[calc(clamp(28px,7vw,40px)*var(--text-scale))] leading-[1.1] mb-4" {...fsStyle(scales?.["pilares.title_pre"], undefined, "pilares.title_pre")}>
            {c.title_pre}{" "}
            <em className="italic text-bordo">{c.title_accent}</em>
          </motion.h2>
          <motion.div variants={fadeUp} className="font-sans text-gris-bordo max-w-[480px] leading-relaxed" {...fsStyle(scales?.["pilares.intro"], { fontSize: "var(--fs-caption)" }, "pilares.intro")}>
            <RichText html={c.intro} className="rich-inline" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pilares.map((pilar) => (
            <motion.div
              key={pilar.num}
              variants={fadeUp}
              className="group pt-8 cursor-default"
            >
              <div className="w-full h-px bg-dorado/20 mb-8" />
              <span className="block font-mono text-bordo opacity-60 group-hover:opacity-100 transition-opacity duration-300 mb-3" style={{ fontSize: "var(--fs-micro)" }}>
                {pilar.num}
              </span>
              <p className="font-playfair font-bold text-negro-bordo leading-[1.15] mb-3 transition-transform duration-300 ease-out group-hover:-translate-y-1" {...fsStyle(scales?.[`pilares.pilar_${pilar.n}_title`], { fontSize: "var(--fs-lead)" }, `pilares.pilar_${pilar.n}_title`)}>
                {pilar.titulo}
              </p>
              <RichText
                html={pilar.descripcion}
                className="rich-inline font-sans text-gris-bordo leading-[1.7]"
                style={{ fontSize: "var(--fs-body)" }}
                scale={scales?.[`pilares.pilar_${pilar.n}_desc`]}
                fkey={`pilares.pilar_${pilar.n}_desc`}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CIERRE
═══════════════════════════════════════════════════════════════ */
function CierreSection({ c, scales }: { c: Record<string, string>; scales?: FieldScaleMap }) {
  return (
    <section className="bg-hueso py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-[760px]"
        >
          <RichText
            html={c.paragraph}
            className="rich-inline font-playfair text-negro-bordo text-[calc(22px*var(--text-scale))] sm:text-[calc(26px*var(--text-scale))] leading-[1.5] mb-10"
            scale={scales?.["cierre.paragraph"]}
            fkey="cierre.paragraph"
          />
          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 bg-bordo text-hueso font-sans font-semibold px-8 py-4 rounded-full hover:bg-bordo/90 active:scale-[0.98] transition-all"
            style={{ fontSize: "var(--fs-body)" }}
          >
            {c.button_text}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
export function MisValoresSections({
  content,
  scales,
}: {
  content?: {
    hero?: Record<string, string>
    bio?: Record<string, string>
    pilares?: Record<string, string>
    cierre?: Record<string, string>
  }
  scales?: FieldScaleMap
}) {
  return (
    <>
      <HeroEditorial c={{ ...fallbacksFor("hero"), ...content?.hero }} scales={scales} />
      <BioSection c={{ ...fallbacksFor("bio"), ...content?.bio }} scales={scales} />
      <PilaresSection c={{ ...fallbacksFor("pilares"), ...content?.pilares }} scales={scales} />
      <CierreSection c={{ ...fallbacksFor("cierre"), ...content?.cierre }} scales={scales} />
    </>
  )
}
