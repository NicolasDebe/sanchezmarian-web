"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { fallbacksFor } from "@/lib/servicios-schema"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { IsotipoInfinito } from "@/components/ui/isotipo-infinito"
import { DrawnLine } from "@/components/ui/drawn-line"
import { two, EASE } from "@/components/servicios/types"

const SERVICE_COUNT = 4
const mvp = { once: true, margin: "-80px" } as const
const PAD_X = "clamp(24px, 6vw, 96px)"

/* Convierte un longtext multilínea (un ítem por línea) en array no vacío. */
function lines(raw?: string): string[] {
  return (raw ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean)
}
/* Separa párrafos por línea(s) en blanco. */
function paragraphs(raw?: string): string[] {
  return (raw ?? "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO (se mantiene el diseño existente aprobado por el cliente)
   ════════════════════════════════════════════════════════════════════════ */
const heroContainer = (reduced: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.08 } },
})
const heroWord = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduced ? 0 : 0.8, ease: EASE } },
})

function HeroSection({ hero, serviceCount }: { hero: Record<string, string>; serviceCount: number }) {
  const reduced = useReducedMotion()
  const words = (hero.h1 ?? "").split(/\s+/).filter(Boolean)
  const satelliteDelay = reduced ? 0 : words.length * 0.06 + 0.45
  const eyebrow = (hero.eyebrow ?? "Servicios").trim()
  const description = (hero.description ?? "").trim()

  const satellite = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : satelliteDelay + delay },
  })

  return (
    <section
      className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden bg-hueso sm:min-h-[90vh]"
      style={{ paddingInline: PAD_X, paddingBlock: "120px 96px" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(110% 80% at 100% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.4 }} />
      <TextureOverlay texture="paperGrain" opacity={0.14} />

      <div className="relative mx-auto grid w-full items-center gap-x-12 gap-y-14 lg:grid-cols-[1fr_auto]" style={{ maxWidth: 1180 }}>
        <div>
          <motion.div {...satellite(0)} className="mb-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-dorado/60 bg-arena/40 font-mono uppercase text-bordo" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em", padding: "8px 16px" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
              {eyebrow}
            </span>
          </motion.div>

          <motion.div aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : satelliteDelay + 0.05 }} className="mb-8 h-px origin-left bg-dorado" style={{ width: "clamp(60px, 10vw, 120px)" }} />

          <motion.h1 aria-label={hero.h1} variants={heroContainer(!!reduced)} initial="hidden" animate="visible" className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "calc(clamp(36px, 5.4vw, 88px) * var(--text-scale))", lineHeight: "var(--lh-tight)", letterSpacing: "-0.03em", maxWidth: "18ch" }}>
            {words.map((w, i) => (
              <motion.span key={i} aria-hidden variants={heroWord(!!reduced)} className="inline-block" style={{ marginRight: "0.25em", willChange: "transform, filter" }}>{w}</motion.span>
            ))}
          </motion.h1>

          {description && (
            <motion.div {...satellite(0.15)} className="mt-8 font-sans text-gris-bordo" style={{ fontSize: "calc(clamp(16px, 1.4vw, 20px) * var(--text-scale))", lineHeight: "var(--lh-base)", maxWidth: 560 }}>
              <RichText html={description} className="rich-inline" />
            </motion.div>
          )}
        </div>

        <motion.div
          {...satellite(0.1)}
          className="flex flex-col items-start gap-6 lg:items-center lg:pl-8"
          style={{ color: "var(--color-bordo)" }}
        >
          <IsotipoInfinito size="hero" color="var(--color-bordo)" />
          <DrawnLine vertical width={80} thickness={1} color="var(--color-dorado)" origin="left" delay={satelliteDelay + 0.2} />
          <span className="font-mono uppercase text-bordo/70" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.22em" }}>
            Mendoza — AR
          </span>
        </motion.div>
      </div>

      <motion.span aria-hidden {...satellite(0.25)} className="absolute font-mono uppercase text-bordo/55" style={{ bottom: 36, right: "clamp(28px, 6vw, 96px)", fontSize: "var(--fs-eyebrow)", letterSpacing: "0.22em" }}>
        {two(serviceCount)} — {eyebrow}
      </motion.span>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SEPARADOR EDITORIAL — el isotipo del infinito marca la transición entre
   bloques. Es el ÚNICO elemento decorativo permitido entre secciones.
   Fondo transparente: respira sobre el lienzo, con padding vertical generoso.
   ════════════════════════════════════════════════════════════════════════ */
function Separador() {
  return (
    <div
      className="flex justify-center"
      style={{ paddingBlock: "clamp(48px, 7vw, 96px)", background: "transparent" }}
    >
      <IsotipoInfinito size="transicion" color="var(--color-bordo)" />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   ÁTOMOS TIPOGRÁFICOS (reglas globales de la página) — fontSize por tokens.
   ════════════════════════════════════════════════════════════════════════ */
function Eyebrow({ children, centered }: { children: ReactNode; centered?: boolean }) {
  return (
    <p className="font-mono uppercase text-bordo" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em", textAlign: centered ? "center" : "left" }}>
      {children}
    </p>
  )
}
function GoldLine({ centered }: { centered?: boolean }) {
  return <div className="bg-dorado" style={{ width: 40, height: 1, margin: centered ? "16px auto 24px" : "16px 0 24px" }} />
}
function BlockTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-h2)", lineHeight: 1.12, letterSpacing: "-0.02em", maxWidth: "20ch" }}>
      {children}
    </h2>
  )
}
/* Label: DM Mono uppercase --bordo opacity 0.7. */
function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono uppercase text-bordo/70" style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.18em" }}>
      {children}
    </p>
  )
}
/* Párrafos de descripción / cuerpo: DM Sans --gris-bordo. */
function Intro({ text }: { text?: string }) {
  return (
    <div className="mt-6 flex flex-col gap-4" style={{ maxWidth: 760 }}>
      {paragraphs(text).map((p, i) => (
        <p key={i} className="font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{p}</p>
      ))}
    </div>
  )
}
/* Bullets: DM Sans con marcador • en --bordo. */
function Bullets({ items, className }: { items?: string; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2.5${className ? ` ${className}` : ""}`}>
      {lines(items).map((it, i) => (
        <li key={i} className="flex gap-2.5 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-base)" }}>
          <span aria-hidden className="text-bordo" style={{ flex: "none" }}>•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

/* Sección-bloque con fondo alterno y reveal al entrar en viewport. */
function Block({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <section className={`${bg} py-16 md:py-24`} style={{ paddingInline: PAD_X }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto w-full"
        style={{ maxWidth: 1180 }}
      >
        {children}
      </motion.div>
    </section>
  )
}

function BlockHeader({ c }: { c: Record<string, string> }) {
  return (
    <div style={{ maxWidth: 760 }}>
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <GoldLine />
      <BlockTitle>{c.title}</BlockTitle>
      <Intro text={c.intro} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 2 — PILARES
   ════════════════════════════════════════════════════════════════════════ */
function PilaresSection({ c }: { c: Record<string, string> }) {
  const pilares = [
    { num: "01", title: c.pilar_1_title, items: c.pilar_1_items },
    { num: "02", title: c.pilar_2_title, items: c.pilar_2_items },
    { num: "03", title: c.pilar_3_title, items: c.pilar_3_items },
  ]
  return (
    <Block bg="bg-hueso">
      <div style={{ maxWidth: 760 }}>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <GoldLine />
        <BlockTitle>{c.title}</BlockTitle>
      </div>

      <div className="grid gap-x-10 gap-y-12 md:grid-cols-3" style={{ marginTop: 56 }}>
        {pilares.map((p) => (
          <div key={p.num}>
            <p className="font-mono uppercase text-bordo/55" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.18em", marginBottom: 12 }}>{p.num}</p>
            <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: 1.2, marginBottom: 16 }}>{p.title}</p>
            <Bullets items={p.items} />
          </div>
        ))}
      </div>

      {/* La nota final (intro_note) es la bisagra hacia el catálogo de
          servicios: se muestra como cierre italic centrado bajo los pilares.
          El schema de pilares no define un campo `closing` aparte. */}
      {c.intro_note?.trim() && (
        <p
          className="font-sans text-gris-bordo text-center italic"
          style={{ fontSize: "var(--fs-body)", lineHeight: 1.75, maxWidth: 720, margin: "64px auto 0" }}
        >
          {c.intro_note}
        </p>
      )}
    </Block>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 3 — LOS 4 SERVICIOS
   ════════════════════════════════════════════════════════════════════════ */

/* BLOQUE 01 — Estrategia: 4 sub-puntos (título bold + descripción). */
function Bloque01({ c }: { c: Record<string, string> }) {
  const points = [1, 2, 3, 4]
    .map((n) => ({ title: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((p) => p.title.trim())

  return (
    <Block bg="bg-hueso-oscuro">
      <BlockHeader c={c} />
      <div className="mt-12">
        <Label>{c.includes_label}</Label>
        <div className="mt-7 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {points.map((p) => (
            <div key={p.title}>
              <p className="font-sans font-semibold text-negro-bordo" style={{ fontSize: "var(--fs-body-lg)" }}>{p.title}</p>
              <p className="mt-2 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Block>
  )
}

/* Card de modalidad de prensa: título Playfair + lista, borde dorado. */
function PrensaCard({ name, items }: { name: string; items: string }) {
  return (
    <div className="rounded-2xl border border-dorado/25 p-6 md:p-7">
      <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: 1.2 }}>{name}</p>
      <Bullets items={items} className="mt-5" />
    </div>
  )
}

/* BLOQUE 02 — Prensa: 2 modalidades (cards) + lista común. */
function Bloque02({ c }: { c: Record<string, string> }) {
  return (
    <Block bg="bg-hueso">
      <BlockHeader c={c} />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <PrensaCard name={c.organica_label} items={c.organica_items} />
        <PrensaCard name={c.pautada_label} items={c.pautada_items} />
      </div>
      <div className="mt-12">
        <Label>{c.includes_label}</Label>
        <Bullets items={c.includes_items} className="mt-5" />
      </div>
    </Block>
  )
}

/* BLOQUE 03 — RRPP y eventos: lista + cierre + sub-servicio destacado. */
function Bloque03({ c }: { c: Record<string, string> }) {
  return (
    <Block bg="bg-hueso-oscuro">
      <BlockHeader c={c} />
      <div className="mt-10" style={{ maxWidth: 820 }}>
        <Label>{c.includes_label}</Label>
        <Bullets items={c.includes_items} className="mt-5" />
        {c.closing?.trim() && (
          <p className="mt-7 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{c.closing}</p>
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-dorado/30 bg-hueso p-6 md:p-8" style={{ maxWidth: 820 }}>
        <Label>{c.sub_label}</Label>
        <p className="mt-3 font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: 1.2 }}>{c.sub_title}</p>
        <div className="mt-3 flex flex-col gap-4">
          {paragraphs(c.sub_desc).map((p, i) => (
            <p key={i} className="font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{p}</p>
          ))}
        </div>
      </div>
    </Block>
  )
}

/* BLOQUE 04 — Oratoria y asesoría de imagen: 2 sub-bloques paralelos. */
function Bloque04({ c }: { c: Record<string, string> }) {
  return (
    <Block bg="bg-hueso">
      <BlockHeader c={c} />
      <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
        <div>
          <Label>{c.oratoria_label}</Label>
          <Bullets items={c.oratoria_items} className="mt-4" />
        </div>
        <div>
          <Label>{c.imagen_label}</Label>
          <Bullets items={c.imagen_items} className="mt-4" />
        </div>
      </div>
    </Block>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 4 — CTA FINAL (centrada, sin fondo --bordo) — se conserva tal cual.
   ════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ c }: { c: Record<string, string> }) {
  return (
    <section className="bg-hueso text-center" style={{ paddingInline: PAD_X, paddingBlock: "96px" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: 640 }}
      >
        <Eyebrow centered>{c.eyebrow}</Eyebrow>
        <GoldLine centered />
        <h2 className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-h1)", lineHeight: "var(--lh-tight)", letterSpacing: "-0.02em" }}>
          {c.title}
        </h2>
        <p className="mt-6 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: "var(--lh-relaxed)", maxWidth: 520 }}>
          {c.description}
        </p>
        <Link
          href="/contacto"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-bordo px-8 py-4 font-sans font-semibold text-hueso transition-all hover:bg-bordo/90 active:scale-[0.98]"
          style={{ fontSize: "var(--fs-body)" }}
        >
          {c.button_text}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </motion.div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   ORQUESTADOR — Hero + Pilares + 4 bloques diferenciados, separados por el
   isotipo del infinito. Fondos alternados hueso / hueso-oscuro.
   ════════════════════════════════════════════════════════════════════════ */
export function ServiciosPageSections({
  content,
}: {
  content?: {
    hero?: Record<string, string>
    pilares?: Record<string, string>
    servicio_01?: Record<string, string>
    servicio_02?: Record<string, string>
    servicio_03?: Record<string, string>
    servicio_04?: Record<string, string>
    cta?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const pilares = { ...fallbacksFor("pilares"), ...content?.pilares }
  const s1 = { ...fallbacksFor("servicio_01"), ...content?.servicio_01 }
  const s2 = { ...fallbacksFor("servicio_02"), ...content?.servicio_02 }
  const s3 = { ...fallbacksFor("servicio_03"), ...content?.servicio_03 }
  const s4 = { ...fallbacksFor("servicio_04"), ...content?.servicio_04 }
  const cta = { ...fallbacksFor("cta"), ...content?.cta }

  return (
    <>
      <HeroSection hero={hero} serviceCount={SERVICE_COUNT} />
      <Separador />
      <PilaresSection c={pilares} />
      <Separador />
      <Bloque01 c={s1} />
      <Separador />
      <Bloque02 c={s2} />
      <Separador />
      <Bloque03 c={s3} />
      <Separador />
      <Bloque04 c={s4} />
      <Separador />
      <FinalCTA c={cta} />
    </>
  )
}
