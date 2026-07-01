"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { fallbacksFor } from "@/lib/servicios-schema"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { IsotipoInfinito } from "@/components/ui/isotipo-infinito"
import { DrawnLine } from "@/components/ui/drawn-line"
import { ServiceFeatureCard } from "@/components/servicios/service-feature-card"
import { Conexiones } from "@/components/conexiones"
import type { Connection } from "@/lib/connections"
import { EASE } from "@/components/servicios/types"

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

function HeroSection({ hero }: { hero: Record<string, string> }) {
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
        Estrategia en Comunicación
      </motion.span>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SISTEMA VISUAL ÚNICO — átomos, card reutilizable y listas con guión.
   ════════════════════════════════════════════════════════════════════════ */
function Eyebrow({ children, centered }: { children: ReactNode; centered?: boolean }) {
  return (
    <p className="font-mono uppercase text-bordo" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em", textAlign: centered ? "center" : "left" }}>
      {children}
    </p>
  )
}
function GoldLine({ centered, flush }: { centered?: boolean; flush?: boolean }) {
  return <div className="bg-dorado" style={{ width: 40, height: 1, margin: centered ? "16px auto 24px" : `${flush ? 0 : 16}px 0 24px` }} />
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
/* Párrafos de introducción de sección: DM Sans 16px --gris-bordo. */
function Intro({ text }: { text?: string }) {
  return (
    <div className="mt-6 flex flex-col gap-4" style={{ maxWidth: 760 }}>
      {paragraphs(text).map((p, i) => (
        <p key={i} className="font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{p}</p>
      ))}
    </div>
  )
}

/* Listas de la página: guión corto (—) en --bordo, indent y line-height 1.7.
   `twoCol` divide la lista en 2 columnas dentro de la card (solo desktop). */
function DashList({ items, twoCol }: { items?: string; twoCol?: boolean }) {
  return (
    <ul className={twoCol ? "pl-4 sm:columns-2 sm:gap-x-12" : "flex flex-col gap-2 pl-4"}>
      {lines(items).map((it, i) => (
        <li
          key={i}
          className={`flex gap-2.5 font-sans text-gris-bordo${twoCol ? " mb-2.5 break-inside-avoid" : ""}`}
          style={{ fontSize: "var(--fs-body)", lineHeight: 1.7 }}
        >
          <span aria-hidden className="shrink-0 select-none text-bordo">—</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

/* Sección con fondo configurable (ritmo del scroll) y reveal al entrar.
   `id` habilita anchors (p.ej. #servicio-1) con offset para el nav fijo. */
function Section({ bg, id, children }: { bg: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className={`${bg} py-14 md:py-24 scroll-mt-24 md:scroll-mt-28`} style={{ paddingInline: PAD_X }}>
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
  const eyebrow = (c.eyebrow ?? "").trim()
  return (
    <div style={{ maxWidth: 760 }}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <GoldLine flush={!eyebrow} />
      <BlockTitle>{c.title}</BlockTitle>
      <Intro text={c.intro} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 2 — PILARES (3 cards, jerarquía por línea dorada) — fondo --arena
   ════════════════════════════════════════════════════════════════════════ */
function PilaresSection({ c }: { c: Record<string, string> }) {
  const pilares = [
    { title: c.pilar_1_title, items: c.pilar_1_items },
    { title: c.pilar_2_title, items: c.pilar_2_items },
    { title: c.pilar_3_title, items: c.pilar_3_items },
  ]
  return (
    <Section bg="bg-arena">
      <div style={{ maxWidth: 760 }}>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <GoldLine />
        <BlockTitle>{c.title}</BlockTitle>
      </div>

      <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
        {pilares.map((p) => (
          <ServiceFeatureCard key={p.title} className="flex flex-col">
            <span aria-hidden className="mb-5 h-px w-8 bg-dorado" />
            <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "calc(24px * var(--text-scale))", lineHeight: 1.2, marginBottom: 16 }}>{p.title}</p>
            <DashList items={p.items} />
          </ServiceFeatureCard>
        ))}
      </div>

      {/* La nota final (intro_note) es la bisagra hacia el catálogo. */}
      {c.intro_note?.trim() && (
        <p
          className="font-sans italic text-gris-bordo text-center"
          style={{ fontSize: "var(--fs-body)", lineHeight: 1.75, maxWidth: 720, margin: "56px auto 0" }}
        >
          {c.intro_note}
        </p>
      )}
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 3 — SERVICIO 01 · Estrategia (grid 2x2 de cards) — fondo --hueso
   ════════════════════════════════════════════════════════════════════════ */
function Bloque01({ c }: { c: Record<string, string> }) {
  const points = [1, 2, 3, 4]
    .map((n) => ({ title: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((p) => p.title.trim())

  return (
    <Section bg="bg-hueso" id="servicio-1">
      <BlockHeader c={c} />
      <div className="mt-12">
        <Label>{c.includes_label}</Label>
        <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
          {points.map((p) => (
            <ServiceFeatureCard key={p.title}>
              <span aria-hidden className="mb-4 block h-1.5 w-1.5 rounded-full bg-dorado" />
              <p className="font-sans font-medium text-negro-bordo" style={{ fontSize: "calc(18px * var(--text-scale))", lineHeight: 1.3 }}>{p.title}</p>
              <p className="mt-2 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body)", lineHeight: 1.7 }}>{p.desc}</p>
            </ServiceFeatureCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* Card de modalidad / sub-bloque: título Playfair + lista con guiones. */
function TitledCard({ title, items }: { title: string; items: string }) {
  return (
    <ServiceFeatureCard>
      <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: 1.2, marginBottom: 20 }}>{title}</p>
      <DashList items={items} />
    </ServiceFeatureCard>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 4 — SERVICIO 02 · Prensa (2 modalidades + card común) — fondo --arena
   ════════════════════════════════════════════════════════════════════════ */
function Bloque02({ c }: { c: Record<string, string> }) {
  return (
    <Section bg="bg-arena" id="servicio-2">
      <BlockHeader c={c} />
      <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
        <TitledCard title={c.organica_label} items={c.organica_items} />
        <TitledCard title={c.pautada_label} items={c.pautada_items} />
      </div>
      <ServiceFeatureCard className="mt-4 md:mt-6">
        <Label>{c.includes_label}</Label>
        <div className="mt-5">
          <DashList items={c.includes_items} twoCol />
        </div>
      </ServiceFeatureCard>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 5 — SERVICIO 03 · RRPP (card + sub-servicio destacado) — fondo --hueso
   ════════════════════════════════════════════════════════════════════════ */
function Bloque03({ c }: { c: Record<string, string> }) {
  return (
    <Section bg="bg-hueso" id="servicio-3">
      <BlockHeader c={c} />
      <ServiceFeatureCard className="mt-10">
        <Label>{c.includes_label}</Label>
        <div className="mt-5">
          <DashList items={c.includes_items} />
        </div>
      </ServiceFeatureCard>

      {c.closing?.trim() && (
        <p className="mt-7 font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)", maxWidth: 820 }}>{c.closing}</p>
      )}

      <ServiceFeatureCard className="mt-4 md:mt-6">
        <Label>{c.sub_label}</Label>
        <p className="mt-3 font-playfair font-bold text-negro-bordo" style={{ fontSize: "var(--fs-lead)", lineHeight: 1.2 }}>{c.sub_title}</p>
        <div className="mt-3 flex flex-col gap-4">
          {paragraphs(c.sub_desc).map((p, i) => (
            <p key={i} className="font-sans text-gris-bordo" style={{ fontSize: "var(--fs-body-lg)", lineHeight: "var(--lh-relaxed)" }}>{p}</p>
          ))}
        </div>
      </ServiceFeatureCard>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 6 — SERVICIO 04 · Oratoria (2 cards lado a lado) — fondo --arena
   ════════════════════════════════════════════════════════════════════════ */
function Bloque04({ c }: { c: Record<string, string> }) {
  return (
    <Section bg="bg-arena" id="servicio-4">
      <BlockHeader c={c} />
      <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
        <TitledCard title={c.oratoria_label} items={c.oratoria_items} />
        <TitledCard title={c.imagen_label} items={c.imagen_items} />
      </div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 7 — CTA FINAL — fondo --bordo, texto --hueso, botón invertido.
   ════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ c }: { c: Record<string, string> }) {
  return (
    <section className="bg-bordo text-center" style={{ paddingInline: PAD_X, paddingBlock: "clamp(56px, 8vw, 96px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: 640 }}
      >
        <p className="font-mono uppercase text-hueso/70" style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em" }}>{c.eyebrow}</p>
        <div className="bg-dorado" style={{ width: 40, height: 1, margin: "16px auto 24px" }} />
        <h2 className="font-playfair font-bold text-hueso" style={{ fontSize: "var(--fs-h1)", lineHeight: "var(--lh-tight)", letterSpacing: "-0.02em" }}>
          {c.title}
        </h2>
        <p className="mt-6 font-sans text-hueso/80" style={{ fontSize: "var(--fs-lead)", lineHeight: "var(--lh-relaxed)", maxWidth: 520 }}>
          {c.description}
        </p>
        <Link
          href="/contacto"
          className="group mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-hueso px-8 py-4 font-sans font-semibold text-bordo transition-all hover:bg-hueso-oscuro active:scale-[0.98]"
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
   ORQUESTADOR — Hero + Pilares + 4 servicios + CTA, con ritmo de fondos
   alternados (arena / hueso) para pausar el scroll largo.
   ════════════════════════════════════════════════════════════════════════ */
export function ServiciosPageSections({
  content,
  connections = [],
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
  connections?: Pick<Connection, "id" | "label">[]
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
      <HeroSection hero={hero} />
      <PilaresSection c={pilares} />
      <Bloque01 c={s1} />
      <Bloque02 c={s2} />
      <Bloque03 c={s3} />
      <Bloque04 c={s4} />
      {/* Conexiones al fondo (fondo hueso: Bloque04 arena → hueso → CTA bordó). */}
      <Conexiones connections={connections} bg="bg-hueso" />
      <FinalCTA c={cta} />
    </>
  )
}
