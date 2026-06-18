"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { fallbacksFor } from "@/lib/servicios-schema"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { cn } from "@/lib/utils"
import { buildServicio, two, EASE, type Servicio } from "@/components/servicios/types"
import { ServicioPrincipal } from "@/components/servicios/servicio-principal"
import { ServiciosSecundarios } from "@/components/servicios/servicios-secundarios"
import { AlianzasSection } from "@/components/servicios/alianzas-section"

const SERVICE_KEYS = ["servicio_01", "servicio_02", "servicio_03"] as const

const mvp = { once: true, margin: "-60px" } as const

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO (v4.1 — sin indicador SCROLL inferior)
   ════════════════════════════════════════════════════════════════════════ */

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const heroWord: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
}

function HeroSection({ hero, serviceCount }: { hero: Record<string, string>; serviceCount: number }) {
  const reduced = useReducedMotion()
  const words = (hero.h1 ?? "").split(/\s+/).filter(Boolean)
  const satelliteDelay = reduced ? 0 : words.length * 0.06 + 0.45
  const eyebrow = (hero.eyebrow ?? "Servicios").trim()

  const satellite = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: EASE, delay: satelliteDelay + delay } }

  return (
    <section
      className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden bg-hueso sm:min-h-[90vh]"
      style={{ paddingInline: "clamp(24px, 6vw, 96px)", paddingBlock: "120px 96px" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(110% 80% at 100% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.4 }} />
      <TextureOverlay texture="paperGrain" opacity={0.14} />

      <motion.span aria-hidden {...satellite(0.1)} className="pointer-events-none absolute select-none font-playfair text-dorado" style={{ top: "clamp(80px, 12vh, 140px)", right: "clamp(28px, 6vw, 96px)", fontSize: "clamp(48px, 6vw, 92px)", lineHeight: 1 }}>
        <span className={reduced ? "" : "ms-asterisk inline-block"}>✳</span>
      </motion.span>

      <div className="relative mx-auto w-full" style={{ maxWidth: 1100 }}>
        <motion.div {...satellite(0)} className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-dorado/60 bg-arena/40 font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em", padding: "8px 16px" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
            {eyebrow}
          </span>
        </motion.div>

        <motion.div aria-hidden initial={reduced ? false : { scaleX: 0 }} animate={reduced ? undefined : { scaleX: 1 }} transition={{ duration: 0.7, ease: EASE, delay: satelliteDelay + 0.05 }} className="mb-8 h-px origin-left bg-dorado" style={{ width: "clamp(60px, 10vw, 120px)" }} />

        {/* Estructura estable (siempre spans por palabra) para no romper la
            hidratación cuando reduced difiere server↔client (#418). */}
        <motion.h1 aria-label={hero.h1} variants={reduced ? undefined : heroContainer} initial={reduced ? undefined : "hidden"} animate={reduced ? undefined : "visible"} className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(36px, 5.4vw, 88px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}>
          {words.map((w, i) => (
            <motion.span key={i} aria-hidden variants={reduced ? undefined : heroWord} className="inline-block" style={{ marginRight: "0.25em", willChange: "transform, filter" }}>{w}</motion.span>
          ))}
        </motion.h1>

        <motion.div {...satellite(0.15)} className="mt-8 font-sans text-gris-bordo" style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.6, maxWidth: 560 }}>
          <RichText html={hero.description} className="rich-inline" />
        </motion.div>
      </div>

      <motion.span aria-hidden {...satellite(0.25)} className="absolute font-mono uppercase text-bordo/55" style={{ bottom: 36, right: "clamp(28px, 6vw, 96px)", fontSize: 11, letterSpacing: "0.22em" }}>
        {two(serviceCount)} — {eyebrow}
      </motion.span>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN — TRANSICIÓN CONCEPTUAL
   ════════════════════════════════════════════════════════════════════════ */
function TransitionSection({ phrase }: { phrase: string }) {
  const reduced = useReducedMotion()
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-arena text-center" style={{ padding: "120px clamp(24px, 6vw, 96px)" }}>
      {phrase ? (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={mvp}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-playfair text-negro-bordo"
          style={{ fontSize: "clamp(40px, 5vw, 80px)", lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 900 }}
        >
          {phrase}
        </motion.p>
      ) : (
        <div className="flex flex-col items-center gap-6" aria-hidden>
          <span className={cn("font-playfair text-dorado", !reduced && "ms-asterisk")} style={{ fontSize: 44, lineHeight: 1 }}>✳</span>
          <div className="h-px w-24 bg-dorado/60" />
          <span className="font-mono uppercase text-bordo/45" style={{ fontSize: 11, letterSpacing: "0.3em" }}>02 · 03</span>
        </div>
      )}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN — CTA FINAL (full-bleed --bordo, centrado)
   ════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ cta }: { cta: Record<string, string> }) {
  const reduced = useReducedMotion()
  const eyebrow = (cta.eyebrow ?? "").trim()
  const titlePre = (cta.title_pre ?? "").trim()
  const titleAccent = (cta.title_accent ?? "").trim()
  const desc = (cta.description ?? "").trim()
  const button = (cta.button_text ?? "").trim() || "Conversemos"

  const item = (delay: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: mvp, transition: { duration: 0.65, ease: EASE, delay } }

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-bordo text-center" style={{ padding: "120px clamp(24px, 6vw, 96px)" }}>
      <TextureOverlay texture="paperGrain" opacity={0.1} />
      <div className="relative mx-auto" style={{ maxWidth: 800 }}>
        {eyebrow && (
          <motion.p {...item(0)} className="mb-8 font-mono uppercase text-dorado" style={{ fontSize: 12, letterSpacing: "0.22em" }}>{eyebrow}</motion.p>
        )}
        {(titlePre || titleAccent) && (
          <motion.h2 {...item(0.05)} className="font-playfair font-bold text-hueso" style={{ fontSize: "clamp(40px, 6.5vw, 96px)", lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            {titlePre} {titleAccent && <em className="text-dorado">{titleAccent}</em>}
          </motion.h2>
        )}
        {desc && (
          <motion.div {...item(0.12)} className="mt-8 font-sans text-hueso/80" style={{ fontSize: "clamp(16px, 1.5vw, 20px)", lineHeight: 1.6, maxWidth: 560, marginInline: "auto" }}>
            <RichText html={desc} className="rich-inline" />
          </motion.div>
        )}
        <motion.div {...item(0.18)} className="mt-12">
          <Link href="/#contacto" className="cta-invert group inline-flex items-center gap-3 rounded-xl border-2 border-hueso bg-hueso px-10 font-sans font-semibold text-bordo transition-all duration-300" style={{ fontSize: "clamp(16px, 1.4vw, 19px)", paddingBlock: "clamp(16px,2vw,22px)" }}>
            {button}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   ORQUESTADOR
   ════════════════════════════════════════════════════════════════════════ */
export function ServiciosPageSections({
  content,
}: {
  content?: {
    config?: Record<string, string>
    hero?: Record<string, string>
    servicio_01?: Record<string, string>
    servicio_02?: Record<string, string>
    servicio_03?: Record<string, string>
    transition?: Record<string, string>
    alianzas?: Record<string, string>
    cta?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const cta = { ...fallbacksFor("cta"), ...content?.cta }
  const transitionPhrase = ({ ...fallbacksFor("transition"), ...content?.transition }.phrase ?? "").trim()
  const alianzas = { ...fallbacksFor("alianzas"), ...content?.alianzas }

  const featuredKey =
    (content?.config?.featured && SERVICE_KEYS.includes(content.config.featured as (typeof SERVICE_KEYS)[number])
      ? content.config.featured
      : fallbacksFor("config").featured) || "servicio_02"

  const byKey = Object.fromEntries(
    SERVICE_KEYS.map((k) => [k, buildServicio(k, { ...fallbacksFor(k), ...content?.[k] })]),
  ) as Record<string, Servicio>

  const featured = byKey[featuredKey]
  const secondaries = SERVICE_KEYS.filter((k) => k !== featuredKey).map((k) => byKey[k])

  return (
    <>
      <HeroSection hero={hero} serviceCount={SERVICE_KEYS.length} />
      <ServicioPrincipal s={featured} id="svc-principal" />
      <TransitionSection phrase={transitionPhrase} />
      <ServiciosSecundarios servicios={secondaries} heading="También ofrezco" id="svc-secundarios" />
      <AlianzasSection eyebrow={alianzas.eyebrow} title={alianzas.title} items={alianzas.items} id="svc-alianzas" />
      <FinalCTA cta={cta} />
    </>
  )
}
