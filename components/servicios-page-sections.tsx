"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "motion/react"
import { fallbacksFor } from "@/lib/servicios-schema"
import { useMediaQuery } from "@/lib/use-media-query"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { cn } from "@/lib/utils"

/* ════════════════════════════════════════════════════════════════════════
   TIPOS Y PARSEO DE CONTENIDO
   ════════════════════════════════════════════════════════════════════════ */

type SubServicio = { titulo: string; desc: string }

type Servicio = {
  key: string
  nombre: string
  tagline: string
  descripcion: string
  subServicios: SubServicio[]
  cta: string
  anchorPhrase: string
  testimonial: string
  testimonialAuthor: string
}

const SERVICE_KEYS = ["servicio_01", "servicio_02", "servicio_03"] as const

/** Foto del servicio destacado (única foto de la página). */
const FEATURED_PHOTO = "/images/NAC_4230.jpg"

const PENDING = "[Pendiente — editable desde admin]"
/** Curva elegante (ease-out enfático). */
const EASE = [0.22, 1, 0.36, 1] as const

function buildServicio(key: string, c: Record<string, string>): Servicio {
  const subServicios = [1, 2, 3]
    .map((n) => ({ titulo: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((s) => s.titulo.trim() !== "")
  return {
    key,
    nombre: c.name ?? "",
    tagline: c.tagline ?? "",
    descripcion: c.description ?? "",
    subServicios,
    cta: c.cta_text ?? "Quiero este servicio",
    anchorPhrase: (c.anchor_phrase ?? "").trim(),
    testimonial: (c.testimonial ?? "").trim(),
    testimonialAuthor: (c.testimonial_author ?? "").trim(),
  }
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO (contenido + satélites creativos)
   ════════════════════════════════════════════════════════════════════════ */

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const heroWord: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
}

function HeroSection({
  hero,
  serviceCount,
}: {
  hero: Record<string, string>
  serviceCount: number
}) {
  const reduced = useReducedMotion()
  const words = (hero.h1 ?? "").split(/\s+/).filter(Boolean)
  // Los satélites entran después de las palabras.
  const satelliteDelay = reduced ? 0 : words.length * 0.06 + 0.45
  const eyebrow = (hero.eyebrow ?? "Servicios").trim()

  const satellite = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay: satelliteDelay + delay },
        }

  return (
    <section
      className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden bg-hueso sm:min-h-[90vh]"
      style={{ paddingInline: "clamp(32px, 8vw, 120px)", paddingBlock: "120px 96px" }}
    >
      {/* (f) Gradiente radial sutil arena, esquina superior derecha */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 80% at 100% 0%, var(--color-arena) 0%, transparent 55%)",
          opacity: 0.4,
        }}
      />
      <TextureOverlay texture="paperGrain" opacity={0.14} />

      {/* (c) Asterisco animado en la esquina superior derecha */}
      <motion.span
        aria-hidden
        {...satellite(0.1)}
        className="pointer-events-none absolute select-none font-playfair text-dorado"
        style={{ top: "clamp(80px, 12vh, 140px)", right: "clamp(28px, 6vw, 96px)", fontSize: "clamp(48px, 6vw, 92px)", lineHeight: 1 }}
      >
        <span className={reduced ? "" : "ms-asterisk inline-block"}>✳</span>
      </motion.span>

      <div className="relative mx-auto w-full" style={{ maxWidth: 1100 }}>
        {/* (a) Badge pill eyebrow */}
        <motion.div {...satellite(0)} className="mb-7">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-dorado/60 bg-arena/40 font-mono uppercase text-bordo"
            style={{ fontSize: 11, letterSpacing: "0.2em", padding: "8px 16px" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-dorado" />
            {eyebrow}
          </span>
        </motion.div>

        {/* (b) Línea decorativa dorada que crece */}
        <motion.div
          aria-hidden
          initial={reduced ? false : { scaleX: 0 }}
          animate={reduced ? undefined : { scaleX: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: satelliteDelay + 0.05 }}
          className="mb-8 h-px origin-left bg-dorado"
          style={{ width: "clamp(60px, 10vw, 120px)" }}
        />

        {/* Título contenido */}
        <motion.h1
          variants={reduced ? undefined : heroContainer}
          initial={reduced ? undefined : "hidden"}
          animate={reduced ? undefined : "visible"}
          className="font-playfair font-bold text-negro-bordo"
          style={{
            fontSize: "clamp(36px, 5.4vw, 88px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "18ch",
          }}
        >
          {reduced
            ? hero.h1
            : words.map((w, i) => (
                <motion.span
                  key={i}
                  variants={heroWord}
                  className="inline-block"
                  style={{ marginRight: "0.25em", willChange: "transform, filter" }}
                >
                  {w}
                </motion.span>
              ))}
        </motion.h1>

        {/* Subtítulo */}
        <motion.div
          {...satellite(0.15)}
          className="mt-8 font-sans text-gris-bordo"
          style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.65, maxWidth: 560 }}
        >
          <RichText html={hero.description} className="rich-inline" />
        </motion.div>
      </div>

      {/* (d) Texto satélite inferior derecho */}
      <motion.span
        aria-hidden
        {...satellite(0.25)}
        className="absolute font-mono uppercase text-bordo/55"
        style={{ bottom: 36, right: "clamp(28px, 6vw, 96px)", fontSize: 11, letterSpacing: "0.22em" }}
      >
        0{serviceCount} — {eyebrow}
      </motion.span>

      {/* (e) Indicador de scroll: círculo + texto rotado */}
      <div
        aria-hidden
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ bottom: 30 }}
      >
        <span
          className="font-mono uppercase text-bordo/60"
          style={{ fontSize: 10, letterSpacing: "0.3em", writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="relative flex h-9 w-5 items-start justify-center rounded-full border border-dorado/50 pt-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-dorado", !reduced && "ms-scroll-dot")} />
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   CUERPO — decide desktop scrollytelling vs mobile apilado
   ════════════════════════════════════════════════════════════════════════ */

function ServiciosBody(props: {
  featured: Servicio
  secondaries: Servicio[]
  cta: Record<string, string>
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reduced = useReducedMotion()
  if (isDesktop === true && !reduced) return <ScrollytellingDesktop {...props} />
  return <StackedMobile {...props} reduced={!!reduced} />
}

/* ─── plan de frames (compartido) ──────────────────────────────────────── */

type Frame =
  | { kind: "photo"; range: [number, number] }
  | { kind: "anchor"; range: [number, number] }
  | { kind: "sub"; range: [number, number]; sub: SubServicio }
  | { kind: "card"; range: [number, number]; servicio: Servicio; num: string; dark: boolean }
  | { kind: "cta"; range: [number, number] }

/** Construye los 8 frames del scrollytelling unificado. */
function buildFrames(featured: Servicio, secondaries: Servicio[]): Frame[] {
  const subs = featured.subServicios.slice(0, 3)
  const subStart = 0.22
  const subEnd = 0.58
  const step = (subEnd - subStart) / Math.max(subs.length, 1)

  const frames: Frame[] = [
    { kind: "photo", range: [0, 0.1] },
    { kind: "anchor", range: [0.1, subStart] },
  ]
  subs.forEach((sub, i) => {
    frames.push({ kind: "sub", range: [subStart + step * i, subStart + step * (i + 1)], sub })
  })
  if (secondaries[0])
    frames.push({ kind: "card", range: [0.58, 0.72], servicio: secondaries[0], num: "02", dark: false })
  if (secondaries[1])
    frames.push({ kind: "card", range: [0.72, 0.85], servicio: secondaries[1], num: "03", dark: true })
  frames.push({ kind: "cta", range: [0.85, 1] })
  return frames
}

/* ════════════════════════════════════════════════════════════════════════
   DESKTOP — scrollytelling unificado sticky 1000vh
   ════════════════════════════════════════════════════════════════════════ */

function ScrollytellingDesktop({
  featured,
  secondaries,
  cta,
}: {
  featured: Servicio
  secondaries: Servicio[]
  cta: Record<string, string>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const frames = buildFrames(featured, secondaries)
  const photoScale = useTransform(scrollYProgress, [0, 0.1], [1.06, 1])
  const nFeaturedDots = 2 + featured.subServicios.slice(0, 3).length // foto + ancla + subs

  // Estados del panel izquierdo (cambian de servicio con el scroll).
  const panels = [
    { range: [0, 0.58] as [number, number], eyebrow: "01 — Servicio destacado", title: featured.nombre, tagline: featured.tagline, desc: featured.descripcion },
    secondaries[0] && { range: [0.58, 0.72] as [number, number], eyebrow: "02 — Servicio", title: secondaries[0].nombre, tagline: secondaries[0].tagline, desc: secondaries[0].descripcion },
    secondaries[1] && { range: [0.72, 0.85] as [number, number], eyebrow: "03 — Servicio", title: secondaries[1].nombre, tagline: secondaries[1].tagline, desc: secondaries[1].descripcion },
    { range: [0.85, 1] as [number, number], eyebrow: (cta.eyebrow ?? "").trim() || "Hablemos", title: cta.button_text || "Conversemos", tagline: "", desc: "" },
  ].filter(Boolean) as { range: [number, number]; eyebrow: string; title: string; tagline: string; desc: string }[]

  return (
    <section className="relative bg-hueso" aria-label="Servicios">
      <div ref={ref} style={{ height: "1000vh" }}>
        <div className="sticky top-0 flex h-screen items-stretch overflow-hidden">
          {/* PANEL IZQUIERDO sticky (40%) — contenido cambiante */}
          <div className="relative w-2/5" style={{ paddingInline: "clamp(40px, 5vw, 88px)" }}>
            {panels.map((p, i) => (
              <PanelLayer
                key={i}
                progress={scrollYProgress}
                range={p.range}
                first={i === 0}
                last={i === panels.length - 1}
              >
                <p className="font-mono uppercase text-bordo" style={{ fontSize: 12, letterSpacing: "0.2em" }}>
                  {p.eyebrow}
                </p>
                <div className="mt-6 mb-8 h-px w-16 bg-dorado" />
                <h2
                  className="font-playfair font-bold text-negro-bordo"
                  style={{ fontSize: "clamp(38px, 4.4vw, 72px)", lineHeight: 1.04, letterSpacing: "-0.03em" }}
                >
                  {p.title}
                </h2>
                {p.tagline && (
                  <p className="mt-5 font-playfair italic text-bordo" style={{ fontSize: "clamp(18px, 1.5vw, 23px)" }}>
                    {p.tagline}
                  </p>
                )}
                <div className="mt-6 font-sans text-gris-bordo" style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 460 }}>
                  <RichText html={p.desc} className="rich-inline" />
                </div>
              </PanelLayer>
            ))}
          </div>

          {/* PANEL DERECHO (60%) — frames */}
          <div className="relative w-3/5 overflow-hidden">
            {frames.map((f, i) => {
              const first = i === 0
              const last = i === frames.length - 1
              if (f.kind === "photo")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} first={first}>
                    <motion.div className="relative h-full w-full" style={{ scale: photoScale }}>
                      <Image src={FEATURED_PHOTO} alt={featured.nombre} fill sizes="60vw" className="object-cover" loading="lazy" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(102,0,31,0.42) 0%, rgba(26,0,8,0.18) 45%, transparent 100%)" }} />
                      <TextureOverlay texture="paperGrain" opacity={0.14} />
                    </motion.div>
                  </FrameLayer>
                )
              if (f.kind === "anchor")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} className="flex items-center bg-arena" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                    {featured.anchorPhrase ? (
                      <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(40px, 5vw, 80px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                        {featured.anchorPhrase}
                      </p>
                    ) : (
                      <p className="font-sans text-bordo/60" style={{ fontSize: 18, maxWidth: 460 }}>{PENDING}</p>
                    )}
                  </FrameLayer>
                )
              if (f.kind === "sub")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} className="flex items-center justify-center bg-hueso-oscuro" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                    <SubCard sub={f.sub} />
                  </FrameLayer>
                )
              if (f.kind === "card")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} className={f.dark ? "bg-bordo" : "bg-hueso-oscuro"}>
                    <SecondaryCard servicio={f.servicio} num={f.num} dark={f.dark} progress={scrollYProgress} range={f.range} />
                  </FrameLayer>
                )
              return (
                <FrameLayer key={i} progress={scrollYProgress} range={f.range} last={last} className="flex flex-col items-start justify-center bg-bordo" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                  <CtaCard cta={cta} />
                </FrameLayer>
              )
            })}

            <ProgressDots frames={frames} progress={scrollYProgress} featuredCount={nFeaturedDots} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── capas con plateau (aparece rápido, se queda, se va rápido) ────────── */

function FrameLayer({
  progress,
  range,
  first,
  last,
  className,
  style,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  first?: boolean
  last?: boolean
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const [s, e] = range
  const f = 0.03
  // Dominio completo [0,1] para que NO haya extrapolación fuera de la banda
  // (motion v12 no clampea por defecto): la capa queda en 0 fuera de su tramo.
  const input = first ? [0, e - f, e, 1] : last ? [0, s, s + f, 1] : [0, s, s + f, e - f, e, 1]
  const out = first ? [1, 1, 0, 0] : last ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0]
  const opacity = useTransform(progress, input, out)
  return (
    <motion.div className={cn("absolute inset-0", className)} style={{ opacity, willChange: "opacity", ...style }}>
      {children}
    </motion.div>
  )
}

/** Panel izquierdo: cross-fade con leve slide + blur (counter feel). */
function PanelLayer({
  progress,
  range,
  first,
  last,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  first?: boolean
  last?: boolean
  children: React.ReactNode
}) {
  const [s, e] = range
  const f = 0.04
  const input = first ? [0, e - f, e, 1] : last ? [0, s, s + f, 1] : [0, s, s + f, e - f, e, 1]
  const opacity = useTransform(progress, input, first ? [1, 1, 0, 0] : last ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0])
  const y = useTransform(progress, input, first ? [0, 0, -28, -28] : last ? [34, 34, 0, 0] : [34, 34, 0, 0, -28, -28])
  const filter = useTransform(
    progress,
    input,
    first
      ? ["blur(0px)", "blur(0px)", "blur(8px)", "blur(8px)"]
      : last
        ? ["blur(8px)", "blur(8px)", "blur(0px)", "blur(0px)"]
        : ["blur(8px)", "blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)", "blur(8px)"],
  )
  return (
    <motion.div className="absolute inset-0 flex flex-col justify-center" style={{ opacity, y, filter, willChange: "opacity, transform" }}>
      {children}
    </motion.div>
  )
}

/* ─── sub-servicio card (Mentoría) ─────────────────────────────────────── */
function SubCard({ sub }: { sub: SubServicio }) {
  return (
    <div
      className="ms-breathe rounded-3xl bg-hueso p-10 shadow-[0_24px_70px_-28px_rgba(102,0,31,0.45)]"
      style={{ maxWidth: 460, border: "1px solid rgba(201,168,130,0.45)" }}
    >
      <span className="font-mono uppercase text-bordo/60" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
        Sub-servicio
      </span>
      <p className="mt-4 font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(24px, 2.2vw, 34px)", lineHeight: 1.15 }}>
        {sub.titulo}
      </p>
      <RichText html={sub.desc} className="rich-inline mt-4 font-sans text-gris-bordo" style={{ fontSize: 16, lineHeight: 1.7 }} />
    </div>
  )
}

/* ─── card de servicio secundario 02 / 03 ──────────────────────────────── */
function SecondaryCard({
  servicio,
  num,
  dark,
  progress,
  range,
}: {
  servicio: Servicio
  num: string
  dark: boolean
  progress: MotionValue<number>
  range: [number, number]
}) {
  const numY = useTransform(progress, range, [70, -70])
  const titleColor = dark ? "text-hueso" : "text-negro-bordo"
  const taglineColor = dark ? "text-dorado" : "text-bordo"
  const descColor = dark ? "text-hueso/85" : "text-gris-bordo"
  const subColor = dark ? "text-hueso/80" : "text-gris-bordo"
  const stroke = dark ? "var(--color-hueso)" : "var(--color-bordo)"

  return (
    <div className="relative flex h-full w-full items-center overflow-hidden" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
      {/* Número gigante de fondo (con parallax vertical) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-end"
        style={{ y: numY }}
      >
        <span
          className="select-none font-playfair font-bold leading-none"
          style={{
            marginRight: "-2%",
            fontSize: "clamp(240px, 30vw, 420px)",
            color: "transparent",
            WebkitTextStroke: `2px ${stroke}`,
            opacity: 0.1,
          }}
        >
          {num}
        </span>
      </motion.div>

      <div className="relative z-10" style={{ maxWidth: 480 }}>
        <span
          className={cn("inline-flex items-center gap-2 rounded-full font-mono uppercase", taglineColor)}
          style={{ fontSize: 11, letterSpacing: "0.18em", padding: "7px 14px", border: `1px solid ${dark ? "rgba(254,252,239,0.4)" : "rgba(201,168,130,0.6)"}` }}
        >
          Servicio {num}
        </span>
        <h3 className={cn("mt-6 font-playfair font-bold", titleColor)} style={{ fontSize: "clamp(36px, 4vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {servicio.nombre}
        </h3>
        {servicio.tagline && (
          <p className={cn("mt-4 font-playfair italic", taglineColor)} style={{ fontSize: "clamp(17px, 1.4vw, 21px)" }}>
            {servicio.tagline}
          </p>
        )}
        <ul className="mt-8 flex flex-col gap-4">
          {servicio.subServicios.map((sub, i) => (
            <li key={i} className="flex gap-3">
              <span className={cn("select-none font-playfair", taglineColor)} style={{ fontSize: 20, lineHeight: 1.3 }}>—</span>
              <div>
                <p className={cn("font-sans font-semibold", titleColor)} style={{ fontSize: 15.5, lineHeight: 1.4 }}>{sub.titulo}</p>
                <RichText html={sub.desc} className={cn("rich-inline mt-1 font-sans", subColor)} style={{ fontSize: 13.5, lineHeight: 1.6 }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ─── card CTA (frame final) ───────────────────────────────────────────── */
function CtaCard({ cta }: { cta: Record<string, string> }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <span className="font-mono uppercase text-dorado" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
        {(cta.eyebrow ?? "").trim() || "Hablemos"}
      </span>
      <h3 className="mt-6 font-playfair font-bold text-hueso" style={{ fontSize: "clamp(36px, 4vw, 64px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>
        {cta.title_pre} <em className="text-dorado">{cta.title_accent}</em>
      </h3>
      {cta.description && (
        <div className="mt-6 font-sans text-hueso/85" style={{ fontSize: 17, lineHeight: 1.7 }}>
          <RichText html={cta.description} className="rich-inline" />
        </div>
      )}
      <Link
        href="/#contacto"
        className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-hueso px-9 py-4 font-sans font-semibold text-bordo transition-all duration-300 hover:bg-arena"
        style={{ fontSize: 16 }}
      >
        {cta.button_text || "Conversemos"}
        <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </Link>
    </div>
  )
}

/* ─── indicador lateral de progreso (un dot por frame) ─────────────────── */
function ProgressDots({
  frames,
  progress,
  featuredCount,
}: {
  frames: Frame[]
  progress: MotionValue<number>
  featuredCount: number
}) {
  return (
    <div className="absolute right-7 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-4">
      <div className="absolute top-0 h-full w-px bg-dorado/25" />
      {frames.map((f, i) => (
        <Dot key={i} progress={progress} range={f.range} ring={i < featuredCount} />
      ))}
    </div>
  )
}

function Dot({
  progress,
  range,
  ring,
}: {
  progress: MotionValue<number>
  range: [number, number]
  ring: boolean
}) {
  const [s, e] = range
  const mid = (s + e) / 2
  const a = Math.max(s, 0.0001)
  const b = Math.min(e, 0.9999)
  // Dominio completo: fuera de su tramo el dot queda en reposo (sin extrapolar).
  const scale = useTransform(progress, [0, a, mid, b, 1], [1, 1, 1.7, 1, 1])
  const bg = useTransform(progress, [0, a, mid, b, 1], ["#C9A882", "#C9A882", "#66001F", "#C9A882", "#C9A882"])
  return (
    <span className="relative z-10 flex items-center justify-center" style={{ width: 16, height: 16 }}>
      {ring && <span className="absolute inset-0 rounded-full border" style={{ borderColor: "rgba(201,168,130,0.7)" }} />}
      <motion.span className="rounded-full" style={{ width: 9, height: 9, scale, backgroundColor: bg }} />
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   MOBILE — bloques apilados con entrada al viewport
   ════════════════════════════════════════════════════════════════════════ */

const mvp = { once: true, margin: "-60px" } as const
const springIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
}

function StackedMobile({
  featured,
  secondaries,
  cta,
  reduced,
}: {
  featured: Servicio
  secondaries: Servicio[]
  cta: Record<string, string>
  reduced: boolean
}) {
  const anim = reduced
    ? {}
    : { variants: springIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp }

  return (
    <section className="bg-hueso" aria-label="Servicios">
      {/* Hero del servicio destacado */}
      <div style={{ padding: "64px 24px 36px" }}>
        <p className="font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
          01 — Servicio destacado
        </p>
        <div className="mt-4 mb-6 h-px w-16 bg-dorado" />
        <h2 className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(32px, 9vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>
          {featured.nombre}
        </h2>
        {featured.tagline && (
          <p className="mt-4 font-playfair italic text-bordo" style={{ fontSize: 19 }}>{featured.tagline}</p>
        )}
        <div className="mt-5 font-sans text-gris-bordo" style={{ fontSize: 16, lineHeight: 1.7 }}>
          <RichText html={featured.descripcion} className="rich-inline" />
        </div>
      </div>

      {/* Foto */}
      <motion.div {...anim} className="relative mx-6 overflow-hidden rounded-2xl" style={{ aspectRatio: "4 / 5" }}>
        <Image src={FEATURED_PHOTO} alt={featured.nombre} fill sizes="100vw" className="object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(102,0,31,0.35), transparent 60%)" }} />
      </motion.div>

      {/* Frase ancla */}
      <div className="mt-10 bg-arena" style={{ padding: "72px 24px" }}>
        {featured.anchorPhrase ? (
          <motion.p {...anim} className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(30px, 8vw, 44px)", lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            {featured.anchorPhrase}
          </motion.p>
        ) : (
          <p className="font-sans text-bordo/60" style={{ fontSize: 15 }}>{PENDING}</p>
        )}
      </div>

      {/* Sub-servicios del destacado (cards) */}
      <div style={{ padding: "48px 24px 8px" }}>
        <p className="mb-6 font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.18em" }}>Sub-servicios</p>
        <div className="flex flex-col gap-5">
          {featured.subServicios.map((sub, i) => (
            <motion.div
              key={i}
              {...(reduced ? {} : { variants: springIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp })}
              className="rounded-2xl bg-hueso-oscuro p-7"
              style={{ border: "1px solid rgba(201,168,130,0.4)" }}
            >
              <span className="font-mono uppercase text-bordo/60" style={{ fontSize: 10, letterSpacing: "0.18em" }}>Sub-servicio</span>
              <p className="mt-3 font-playfair font-bold text-negro-bordo" style={{ fontSize: 22, lineHeight: 1.2 }}>{sub.titulo}</p>
              <RichText html={sub.desc} className="rich-inline mt-3 font-sans text-gris-bordo" style={{ fontSize: 14.5, lineHeight: 1.65 }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Servicios secundarios 02 / 03 */}
      {secondaries.map((s, i) => (
        <SecondaryBlockMobile key={s.key} s={s} num={i === 0 ? "02" : "03"} dark={i === 1} reduced={reduced} />
      ))}

      {/* CTA final */}
      <div className="mt-2 bg-bordo" style={{ padding: "72px 24px" }}>
        <motion.div {...anim}>
          <span className="font-mono uppercase text-dorado" style={{ fontSize: 11, letterSpacing: "0.2em" }}>
            {(cta.eyebrow ?? "").trim() || "Hablemos"}
          </span>
          <h3 className="mt-5 font-playfair font-bold text-hueso" style={{ fontSize: "clamp(30px, 8vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
            {cta.title_pre} <em className="text-dorado">{cta.title_accent}</em>
          </h3>
          {cta.description && (
            <div className="mt-5 font-sans text-hueso/85" style={{ fontSize: 16, lineHeight: 1.7 }}>
              <RichText html={cta.description} className="rich-inline" />
            </div>
          )}
          <Link
            href="/#contacto"
            className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-hueso px-8 py-4 font-sans font-semibold text-bordo"
            style={{ fontSize: 16 }}
          >
            {cta.button_text || "Conversemos"}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function SecondaryBlockMobile({
  s,
  num,
  dark,
  reduced,
}: {
  s: Servicio
  num: string
  dark: boolean
  reduced: boolean
}) {
  const anim = reduced
    ? {}
    : { variants: springIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp }
  const bg = dark ? "bg-bordo" : "bg-hueso-oscuro"
  const titleColor = dark ? "text-hueso" : "text-negro-bordo"
  const taglineColor = dark ? "text-dorado" : "text-bordo"
  const descColor = dark ? "text-hueso/85" : "text-gris-bordo"
  const subColor = dark ? "text-hueso/80" : "text-gris-bordo"
  const stroke = dark ? "var(--color-hueso)" : "var(--color-bordo)"

  return (
    <div className={cn("relative mt-2 overflow-hidden", bg)} style={{ padding: "72px 24px" }}>
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-playfair font-bold leading-none"
        style={{ right: "-4%", top: 24, fontSize: 200, color: "transparent", WebkitTextStroke: `2px ${stroke}`, opacity: 0.12 }}
      >
        {num}
      </span>
      <motion.div {...anim} className="relative z-10">
        <span
          className={cn("inline-flex items-center rounded-full font-mono uppercase", taglineColor)}
          style={{ fontSize: 11, letterSpacing: "0.18em", padding: "7px 14px", border: `1px solid ${dark ? "rgba(254,252,239,0.4)" : "rgba(201,168,130,0.6)"}` }}
        >
          Servicio {num}
        </span>
        <h3 className={cn("mt-5 font-playfair font-bold", titleColor)} style={{ fontSize: "clamp(30px, 8vw, 46px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>
          {s.nombre}
        </h3>
        {s.tagline && (
          <p className={cn("mt-3 font-playfair italic", taglineColor)} style={{ fontSize: 18 }}>{s.tagline}</p>
        )}
        <div className={cn("mt-5 font-sans", descColor)} style={{ fontSize: 15.5, lineHeight: 1.7 }}>
          <RichText html={s.descripcion} className="rich-inline" />
        </div>
        <ul className="mt-7 flex flex-col gap-4">
          {s.subServicios.map((sub, i) => (
            <li key={i} className="flex gap-3">
              <span className={cn("select-none font-playfair", taglineColor)} style={{ fontSize: 20, lineHeight: 1.3 }}>—</span>
              <div>
                <p className={cn("font-sans font-semibold", titleColor)} style={{ fontSize: 15, lineHeight: 1.4 }}>{sub.titulo}</p>
                <RichText html={sub.desc} className={cn("rich-inline mt-1 font-sans", subColor)} style={{ fontSize: 13.5, lineHeight: 1.6 }} />
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
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
    cta?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const cta = { ...fallbacksFor("cta"), ...content?.cta }

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
      <ServiciosBody featured={featured} secondaries={secondaries} cta={cta} />
    </>
  )
}
