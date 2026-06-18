"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { fallbacksFor } from "@/lib/servicios-schema"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { IsotipoInfinito } from "@/components/ui/isotipo-infinito"
import { SplitWords } from "@/components/ui/split-words"
import { DrawnLine } from "@/components/ui/drawn-line"
import { maskRevealVariants } from "@/lib/animations"
import { buildServicio, two, EASE, type Servicio } from "@/components/servicios/types"
import { ServicioPrincipal } from "@/components/servicios/servicio-principal"
import { ServiciosSecundarios } from "@/components/servicios/servicios-secundarios"
import { AlianzasSection } from "@/components/servicios/alianzas-section"

const SERVICE_KEYS = ["servicio_01", "servicio_02", "servicio_03"] as const

const mvp = { once: true, margin: "-60px" } as const

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO (v4.1 — sin indicador SCROLL inferior)
   ════════════════════════════════════════════════════════════════════════ */

/* Variantes reduced-aware. Clave: el cliente SIEMPRE anima a "visible" (no se
   gatea `animate` por reduced), porque el SSR no conoce reduced y rinde el
   estado "hidden"; si `animate` quedara undefined bajo reduced, las palabras
   quedarían atascadas en hidden. Bajo reduced el movimiento se neutraliza
   (sin blur/desplazamiento, duración 0): aparece al instante. */
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

  // Siempre anima a visible; bajo reduced es instantáneo (sin desplazamiento).
  // Si se gateara `animate` por reduced, el estado inicial del SSR quedaría
  // atascado (el SSR no conoce reduced y rinde opacity:0).
  const satellite = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : satelliteDelay + delay },
  })

  return (
    <section
      className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden bg-hueso sm:min-h-[90vh]"
      style={{ paddingInline: "clamp(24px, 6vw, 96px)", paddingBlock: "120px 96px" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(110% 80% at 100% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.4 }} />
      <TextureOverlay texture="paperGrain" opacity={0.14} />

      <div className="relative mx-auto grid w-full items-center gap-x-12 gap-y-14 lg:grid-cols-[1fr_auto]" style={{ maxWidth: 1180 }}>
        {/* Columna izquierda — título y copy (en mobile va arriba) */}
        <div>
          <motion.div {...satellite(0)} className="mb-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-dorado/60 bg-arena/40 font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em", padding: "8px 16px" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
              {eyebrow}
            </span>
          </motion.div>

          <motion.div aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 0.7, ease: EASE, delay: reduced ? 0 : satelliteDelay + 0.05 }} className="mb-8 h-px origin-left bg-dorado" style={{ width: "clamp(60px, 10vw, 120px)" }} />

          {/* Estructura estable (siempre spans por palabra) para no romper la
              hidratación cuando reduced difiere server↔client (#418). */}
          <motion.h1 aria-label={hero.h1} variants={heroContainer(!!reduced)} initial="hidden" animate="visible" className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(36px, 5.4vw, 88px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "16ch" }}>
            {words.map((w, i) => (
              <motion.span key={i} aria-hidden variants={heroWord(!!reduced)} className="inline-block" style={{ marginRight: "0.25em", willChange: "transform, filter" }}>{w}</motion.span>
            ))}
          </motion.h1>

          <motion.div {...satellite(0.15)} className="mt-8 font-sans text-gris-bordo" style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.6, maxWidth: 560 }}>
            <RichText html={hero.description} className="rich-inline" />
          </motion.div>
        </div>

        {/* Columna derecha — composición identitaria con el isotipo
            (en mobile baja debajo del título) */}
        <motion.div
          {...satellite(0.1)}
          className="flex flex-col items-start gap-6 lg:items-center lg:pl-8"
          style={{ color: "var(--color-bordo)" }}
        >
          <IsotipoInfinito size="hero" color="var(--color-bordo)" />
          <DrawnLine vertical width={80} thickness={1} color="var(--color-dorado)" origin="left" delay={satelliteDelay + 0.2} />
          <span className="font-mono uppercase text-bordo/70" style={{ fontSize: 11, letterSpacing: "0.22em" }}>
            Mendoza — AR
          </span>
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
function TransitionSection({ phrase, numbers, heading }: { phrase: string; numbers: string[]; heading: string }) {
  const reduced = !!useReducedMotion()
  const item = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: mvp,
    transition: { duration: reduced ? 0 : 0.65, ease: EASE, delay: reduced ? 0 : delay },
  })

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-hueso text-center" style={{ padding: "clamp(120px, 16vh, 180px) clamp(24px, 6vw, 96px)" }}>
      {/* Frase puente opcional (contenido editable; sólo si existe). */}
      {phrase && (
        <motion.p
          {...item(0)}
          className="mb-12 font-playfair text-negro-bordo"
          style={{ fontSize: "clamp(32px, 4.4vw, 64px)", lineHeight: 1.12, letterSpacing: "-0.02em", maxWidth: 900 }}
        >
          {phrase}
        </motion.p>
      )}

      <IsotipoInfinito size="transicion" color="var(--color-bordo)" />

      {/* Dos líneas doradas creciendo desde el centro hacia los costados. */}
      <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
        <DrawnLine width="clamp(120px, 20vw, 200px)" thickness={1.5} opacity={0.55} origin="right" delay={0.25} />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
        <DrawnLine width="clamp(120px, 20vw, 200px)" thickness={1.5} opacity={0.55} origin="left" delay={0.25} />
      </div>

      {numbers.length > 0 && (
        <motion.span {...item(0.15)} className="mt-7 font-mono uppercase text-bordo/50" style={{ fontSize: 14, letterSpacing: "0.3em" }}>
          {numbers.join(" · ")}
        </motion.span>
      )}

      {heading && (
        <motion.p {...item(0.22)} className="mt-10 font-playfair italic text-negro-bordo" style={{ fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.15 }}>
          {heading}
        </motion.p>
      )}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN — CTA FINAL (full-bleed --bordo, centrado)
   ════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ cta }: { cta: Record<string, string> }) {
  const reduced = !!useReducedMotion()
  const eyebrow = (cta.eyebrow ?? "").trim()
  const titlePre = (cta.title_pre ?? "").trim()
  const titleAccent = (cta.title_accent ?? "").trim()
  const desc = (cta.description ?? "").trim()
  const button = (cta.button_text ?? "").trim() || "Conversemos"

  const item = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: mvp,
    transition: { duration: reduced ? 0 : 0.65, ease: EASE, delay: reduced ? 0 : delay },
  })

  const accentMask = maskRevealVariants(1, !!reduced)

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-bordo text-center" style={{ padding: "120px clamp(24px, 6vw, 96px)" }}>
      <TextureOverlay texture="paperGrain" opacity={0.1} />
      <div className="relative mx-auto flex flex-col items-center" style={{ maxWidth: 820 }}>
        <motion.div {...item(0)} className="mb-7" style={{ color: "var(--color-hueso)" }}>
          <IsotipoInfinito size="small" color="var(--color-hueso)" />
        </motion.div>

        {eyebrow && (
          <motion.p {...item(0.05)} className="mb-8 font-mono uppercase text-dorado" style={{ fontSize: 12, letterSpacing: "0.22em" }}>{eyebrow}</motion.p>
        )}
        {(titlePre || titleAccent) && (
          <h2 className="font-playfair font-bold text-hueso" style={{ fontSize: "clamp(40px, 6.5vw, 96px)", lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            {titlePre && <SplitWords as="span" text={titlePre} delay={0.1} className="block" />}
            {titleAccent && (
              <motion.em
                variants={accentMask}
                initial="hidden"
                whileInView="visible"
                viewport={mvp}
                className="mt-1 block not-italic font-playfair italic text-dorado"
              >
                {titleAccent}
              </motion.em>
            )}
          </h2>
        )}
        {desc && (
          <motion.div {...item(0.18)} className="mt-8 font-sans text-hueso/80" style={{ fontSize: "clamp(16px, 1.5vw, 20px)", lineHeight: 1.6, maxWidth: 560, marginInline: "auto" }}>
            <RichText html={desc} className="rich-inline" />
          </motion.div>
        )}
        <motion.div {...item(0.24)} className="mt-12">
          <Link href="/#contacto" className="cta-invert cta-arrow group inline-flex items-center gap-3 rounded-xl border-2 border-hueso bg-hueso px-10 font-sans font-semibold text-bordo transition-all duration-300 active:scale-[0.98]" style={{ fontSize: "clamp(16px, 1.4vw, 19px)", paddingBlock: "clamp(16px,2vw,22px)" }}>
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
      <TransitionSection
        phrase={transitionPhrase}
        numbers={secondaries.map((s) => s.numero).filter(Boolean)}
        heading="También ofrezco"
      />
      <ServiciosSecundarios servicios={secondaries} id="svc-secundarios" />
      <AlianzasSection eyebrow={alianzas.eyebrow} title={alianzas.title} items={alianzas.items} id="svc-alianzas" />
      <FinalCTA cta={cta} />
    </>
  )
}
