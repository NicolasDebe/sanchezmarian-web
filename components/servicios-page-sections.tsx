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

/** Foto destacada del servicio protagonista (la única foto de la página). */
const FEATURED_PHOTO = "/images/NAC_4230.jpg"

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

const PENDING = "[Contenido pendiente — editable desde admin]"
const EASE = [0.16, 1, 0.3, 1] as const

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO INTRO
   ════════════════════════════════════════════════════════════════════════ */

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const heroWord: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(20px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
}

function HeroSection({ hero }: { hero: Record<string, string> }) {
  const reduced = useReducedMotion()
  const words = (hero.h1 ?? "").split(/\s+/).filter(Boolean)

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-hueso"
      style={{ paddingInline: "clamp(24px, 6vw, 96px)", paddingBlock: "120px 96px" }}
    >
      {/* Gradiente radial sutil en arena, top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, var(--color-arena) 0%, transparent 55%)",
        }}
      />
      <TextureOverlay texture="paperGrain" opacity={0.16} />

      <div className="relative mx-auto w-full max-w-[1400px]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-7 font-mono uppercase text-bordo"
          style={{ fontSize: 12, letterSpacing: "0.22em" }}
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          variants={reduced ? undefined : heroContainer}
          initial={reduced ? undefined : "hidden"}
          animate={reduced ? undefined : "visible"}
          className="font-playfair font-bold text-negro-bordo"
          style={{
            fontSize: "clamp(40px, 7.5vw, 120px)",
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            maxWidth: "16ch",
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: reduced ? 0 : 0.5 }}
          className="mt-9 font-sans text-gris-bordo"
          style={{ fontSize: "clamp(16px, 1.6vw, 21px)", lineHeight: 1.65, maxWidth: 620 }}
        >
          <RichText html={hero.description} className="rich-inline" />
        </motion.div>
      </div>

      {/* Indicador de scroll — línea dorada animada */}
      <div
        aria-hidden
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        style={{ bottom: 32 }}
      >
        <span
          className="mb-3 font-mono uppercase text-bordo/60"
          style={{ fontSize: 10, letterSpacing: "0.2em" }}
        >
          Scroll
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-dorado/30">
          {!reduced && (
            <motion.div
              className="absolute left-0 top-0 h-1/2 w-full bg-dorado"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
            />
          )}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 2 — SERVICIO DESTACADO
   ════════════════════════════════════════════════════════════════════════ */

function FeaturedSection({ s }: { s: Servicio }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reduced = useReducedMotion()

  // SSR / mobile / reduced-motion → versión apilada (todo el contenido en DOM).
  if (isDesktop === true && !reduced) return <FeaturedDesktop s={s} />
  return <FeaturedMobile s={s} reduced={!!reduced} />
}

/* ─── Desktop: scrollytelling sticky 400vh ──────────────────────────────── */

function FeaturedDesktop({ s }: { s: Servicio }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const lineScale = useTransform(scrollYProgress, [0.02, 0.95], [0, 1])

  // Opacidad por frame (con cross-fade en los bordes).
  const f1 = useTransform(scrollYProgress, [0, 0.04, 0.2, 0.27], [1, 1, 1, 0])
  const f2 = useTransform(scrollYProgress, [0.24, 0.3, 0.46, 0.52], [0, 1, 1, 0])
  const f3 = useTransform(scrollYProgress, [0.49, 0.55, 0.71, 0.77], [0, 1, 1, 0])
  const f4 = useTransform(scrollYProgress, [0.74, 0.8, 1], [0, 1, 1])

  const photoScale = useTransform(scrollYProgress, [0, 0.27], [1.06, 1])

  return (
    <section className="relative bg-hueso" aria-label={s.nombre}>
      <div ref={ref} style={{ height: "400vh" }}>
        <div className="sticky top-0 flex h-screen items-stretch overflow-hidden">
          {/* Panel izquierdo sticky (40%) */}
          <div
            className="flex w-2/5 flex-col justify-center"
            style={{ paddingInline: "clamp(40px, 5vw, 88px)" }}
          >
            <p
              className="font-mono uppercase text-bordo"
              style={{ fontSize: 12, letterSpacing: "0.2em" }}
            >
              01 — Servicio destacado
            </p>
            <motion.div
              className="mt-6 mb-8 h-px w-full origin-left bg-dorado"
              style={{ scaleX: lineScale }}
            />
            <h2
              className="font-playfair font-bold text-negro-bordo"
              style={{
                fontSize: "clamp(40px, 4.6vw, 76px)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
              }}
            >
              {s.nombre}
            </h2>
            {s.tagline && (
              <p
                className="mt-5 font-playfair italic text-bordo"
                style={{ fontSize: "clamp(18px, 1.6vw, 24px)" }}
              >
                {s.tagline}
              </p>
            )}
            <div
              className="mt-7 font-sans text-gris-bordo"
              style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 480 }}
            >
              <RichText html={s.descripcion} className="rich-inline" />
            </div>
          </div>

          {/* Panel derecho (60%) — frames */}
          <div className="relative w-3/5 overflow-hidden">
            {/* Frame 1 — foto */}
            <motion.div className="absolute inset-0" style={{ opacity: f1 }}>
              <motion.div className="relative h-full w-full" style={{ scale: photoScale }}>
                <Image
                  src={FEATURED_PHOTO}
                  alt={s.nombre}
                  fill
                  sizes="60vw"
                  className="object-cover"
                  priority={false}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(102,0,31,0.42) 0%, rgba(26,0,8,0.18) 45%, transparent 100%)",
                  }}
                />
                <TextureOverlay texture="paperGrain" opacity={0.14} />
              </motion.div>
            </motion.div>

            {/* Frame 2 — frase ancla */}
            <motion.div
              className="absolute inset-0 flex items-center bg-arena"
              style={{ opacity: f2, paddingInline: "clamp(40px, 5vw, 80px)" }}
            >
              <AnchorPhrase phrase={s.anchorPhrase} progress={scrollYProgress} />
            </motion.div>

            {/* Frame 3 — sub-servicios flotantes */}
            <motion.div
              className="absolute inset-0 overflow-hidden bg-hueso-oscuro"
              style={{ opacity: f3 }}
            >
              <FloatingTags subs={s.subServicios} progress={scrollYProgress} />
            </motion.div>

            {/* Frame 4 — cierre editorial */}
            <motion.div
              className="absolute inset-0 flex flex-col items-start justify-center bg-bordo"
              style={{ opacity: f4, paddingInline: "clamp(40px, 5vw, 80px)" }}
            >
              {s.testimonial ? (
                <figure
                  className="rounded-2xl bg-hueso/10 p-9 backdrop-blur-sm"
                  style={{ maxWidth: 540, border: "1px solid rgba(254,252,239,0.18)" }}
                >
                  <blockquote
                    className="font-playfair italic text-hueso"
                    style={{ fontSize: "clamp(22px, 2vw, 30px)", lineHeight: 1.4 }}
                  >
                    “{s.testimonial}”
                  </blockquote>
                  {s.testimonialAuthor && (
                    <figcaption
                      className="mt-5 font-mono uppercase text-dorado"
                      style={{ fontSize: 11, letterSpacing: "0.18em" }}
                    >
                      {s.testimonialAuthor}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <p
                  className="font-playfair italic text-hueso/80"
                  style={{ fontSize: "clamp(26px, 2.6vw, 44px)", lineHeight: 1.25, maxWidth: 620 }}
                >
                  {s.tagline || s.nombre}
                </p>
              )}
              <Link
                href="/#contacto"
                className="group mt-10 inline-flex items-center gap-2 rounded-lg bg-hueso px-8 py-4 font-sans font-semibold text-bordo transition-all duration-200 hover:bg-arena"
                style={{ fontSize: 15 }}
              >
                Conversemos
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

            <ProgressDots progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Frase ancla: revelado palabra por palabra atado al scroll (rango ~0.30–0.46). */
function AnchorPhrase({
  phrase,
  progress,
}: {
  phrase: string
  progress: MotionValue<number>
}) {
  if (!phrase) {
    return (
      <p
        className="font-sans text-bordo/60"
        style={{ fontSize: 18, maxWidth: 480 }}
      >
        {PENDING}
      </p>
    )
  }
  const words = phrase.split(/\s+/).filter(Boolean)
  const START = 0.3
  const END = 0.46
  const step = (END - START) / words.length

  return (
    <p
      className="font-playfair font-bold text-negro-bordo"
      style={{
        fontSize: "clamp(40px, 5.4vw, 84px)",
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
      }}
    >
      {words.map((w, i) => (
        <AnchorWord
          key={i}
          word={w}
          progress={progress}
          start={START + step * i}
          end={START + step * (i + 0.9)}
        />
      ))}
    </p>
  )
}

function AnchorWord({
  word,
  progress,
  start,
  end,
}: {
  word: string
  progress: MotionValue<number>
  start: number
  end: number
}) {
  const opacity = useTransform(progress, [start, end], [0.12, 1])
  return (
    <motion.span className="inline-block" style={{ opacity, marginRight: "0.25em" }}>
      {word}
    </motion.span>
  )
}

/* Sub-servicios como tags flotantes en posiciones orgánicas. */
const TAG_POS = [
  { top: "18%", left: "8%", rotate: -4 },
  { top: "44%", left: "40%", rotate: 3 },
  { top: "70%", left: "14%", rotate: -2 },
]

function FloatingTags({
  subs,
  progress,
}: {
  subs: SubServicio[]
  progress: MotionValue<number>
}) {
  return (
    <>
      {subs.slice(0, 3).map((sub, i) => (
        <FloatingTag key={i} sub={sub} progress={progress} index={i} />
      ))}
    </>
  )
}

function FloatingTag({
  sub,
  progress,
  index,
}: {
  sub: SubServicio
  progress: MotionValue<number>
  index: number
}) {
  const pos = TAG_POS[index] ?? TAG_POS[0]
  const start = 0.55 + index * 0.05
  const opacity = useTransform(progress, [start, start + 0.06], [0, 1])
  const y = useTransform(progress, [start, start + 0.08], [40, 0])
  const rotate = useTransform(progress, [start, start + 0.08], [pos.rotate * 2.5, pos.rotate])

  return (
    <motion.div
      className="absolute rounded-2xl bg-hueso p-6 shadow-[0_18px_50px_-20px_rgba(102,0,31,0.45)]"
      style={{
        top: pos.top,
        left: pos.left,
        maxWidth: 320,
        opacity,
        y,
        rotate,
        border: "1px solid rgba(201,168,130,0.4)",
      }}
    >
      <p
        className="font-sans font-semibold text-negro-bordo"
        style={{ fontSize: 16, lineHeight: 1.35 }}
      >
        {sub.titulo}
      </p>
      <RichText
        html={sub.desc}
        className="rich-inline mt-2 font-sans text-gris-bordo"
        style={{ fontSize: 13.5, lineHeight: 1.6 }}
      />
    </motion.div>
  )
}

/* Indicador lateral de progreso (4 dots). */
function ProgressDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute right-7 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
      <div className="absolute top-0 h-full w-px bg-dorado/30" />
      {[0, 1, 2, 3].map((i) => (
        <Dot key={i} progress={progress} index={i} />
      ))}
    </div>
  )
}

function Dot({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const center = index * 0.25 + 0.125
  const scale = useTransform(
    progress,
    [center - 0.13, center, center + 0.13],
    [1, 1.7, 1],
  )
  const bg = useTransform(
    progress,
    [center - 0.13, center, center + 0.13],
    ["#C9A882", "#66001F", "#C9A882"],
  )
  return (
    <motion.span
      className="relative z-10 rounded-full"
      style={{ width: 9, height: 9, scale, backgroundColor: bg }}
    />
  )
}

/* ─── Mobile: frames apilados con entrada al viewport ───────────────────── */

const springIn = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
}
const mvp = { once: true, margin: "-60px" } as const

function FeaturedMobile({ s, reduced }: { s: Servicio; reduced: boolean }) {
  const anim = (v: Variants) =>
    reduced
      ? {}
      : { variants: v, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp }

  return (
    <section className="bg-hueso" aria-label={s.nombre}>
      {/* Hero del servicio */}
      <div style={{ padding: "72px 24px 40px" }}>
        <p
          className="font-mono uppercase text-bordo"
          style={{ fontSize: 11, letterSpacing: "0.2em" }}
        >
          01 — Servicio destacado
        </p>
        <div className="mt-4 mb-6 h-px w-16 bg-dorado" />
        <h2
          className="font-playfair font-bold text-negro-bordo"
          style={{ fontSize: "clamp(34px, 10vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}
        >
          {s.nombre}
        </h2>
        {s.tagline && (
          <p className="mt-4 font-playfair italic text-bordo" style={{ fontSize: 19 }}>
            {s.tagline}
          </p>
        )}
        <div
          className="mt-5 font-sans text-gris-bordo"
          style={{ fontSize: 16, lineHeight: 1.7 }}
        >
          <RichText html={s.descripcion} className="rich-inline" />
        </div>
      </div>

      {/* Bloque 1 — foto */}
      <motion.div
        {...anim(springIn)}
        className="relative mx-6 overflow-hidden rounded-2xl"
        style={{ aspectRatio: "4 / 5" }}
      >
        <Image src={FEATURED_PHOTO} alt={s.nombre} fill sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(102,0,31,0.35), transparent 60%)",
          }}
        />
      </motion.div>

      {/* Bloque 2 — frase ancla */}
      <div className="mt-10 bg-arena" style={{ padding: "80px 24px" }}>
        {s.anchorPhrase ? (
          <motion.p
            {...anim({
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            })}
            className="font-playfair font-bold text-negro-bordo"
            style={{ fontSize: "clamp(30px, 8vw, 44px)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
          >
            {reduced
              ? s.anchorPhrase
              : s.anchorPhrase.split(/\s+/).map((w, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                    }}
                    className="inline-block"
                    style={{ marginRight: "0.25em" }}
                  >
                    {w}
                  </motion.span>
                ))}
          </motion.p>
        ) : (
          <p className="font-sans text-bordo/60" style={{ fontSize: 15 }}>
            {PENDING}
          </p>
        )}
      </div>

      {/* Bloque 3 — sub-servicios apilados */}
      <div style={{ padding: "56px 24px 16px" }}>
        <p
          className="mb-6 font-mono uppercase text-bordo"
          style={{ fontSize: 11, letterSpacing: "0.18em" }}
        >
          Sub-servicios
        </p>
        <div className="flex flex-col gap-4">
          {s.subServicios.map((sub, i) => (
            <motion.div
              key={i}
              {...(reduced
                ? {}
                : {
                    variants: springIn,
                    initial: "hidden" as const,
                    whileInView: "visible" as const,
                    viewport: mvp,
                    transition: { delay: i * 0.06 },
                  })}
              className="rounded-2xl bg-hueso p-6"
              style={{ border: "1px solid rgba(201,168,130,0.4)" }}
            >
              <p
                className="font-sans font-semibold text-negro-bordo"
                style={{ fontSize: 16, lineHeight: 1.35 }}
              >
                {sub.titulo}
              </p>
              <RichText
                html={sub.desc}
                className="rich-inline mt-2 font-sans text-gris-bordo"
                style={{ fontSize: 14, lineHeight: 1.65 }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bloque 4 — cierre editorial */}
      <div className="mt-8 bg-bordo" style={{ padding: "64px 24px" }}>
        {s.testimonial && (
          <figure
            className="mb-9 rounded-2xl bg-hueso/10 p-7"
            style={{ border: "1px solid rgba(254,252,239,0.18)" }}
          >
            <blockquote
              className="font-playfair italic text-hueso"
              style={{ fontSize: "clamp(20px, 5.5vw, 26px)", lineHeight: 1.4 }}
            >
              “{s.testimonial}”
            </blockquote>
            {s.testimonialAuthor && (
              <figcaption
                className="mt-4 font-mono uppercase text-dorado"
                style={{ fontSize: 11, letterSpacing: "0.18em" }}
              >
                {s.testimonialAuthor}
              </figcaption>
            )}
          </figure>
        )}
        <Link
          href="/#contacto"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-hueso px-8 py-4 font-sans font-semibold text-bordo"
          style={{ fontSize: 15 }}
        >
          Conversemos
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIONES 3 y 4 — SERVICIOS SECUNDARIOS
   ════════════════════════════════════════════════════════════════════════ */

function SecondarySection({
  s,
  num,
  dark,
}: {
  s: Servicio
  num: string
  dark: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const numY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [80, -80])

  const bg = dark ? "bg-bordo" : "bg-hueso-oscuro"
  const titleColor = dark ? "text-hueso" : "text-negro-bordo"
  const taglineColor = dark ? "text-dorado" : "text-bordo"
  const descColor = dark ? "text-hueso/85" : "text-gris-bordo"
  const subTitleColor = dark ? "text-hueso" : "text-negro-bordo"
  const subDescColor = dark ? "text-hueso/70" : "text-gris-bordo"
  const stroke = dark ? "var(--color-hueso)" : "var(--color-bordo)"

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${bg}`}
      aria-label={s.nombre}
      style={{ padding: "clamp(72px, 12vh, 140px) clamp(24px, 6vw, 88px)" }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        {/* Texto (60%) */}
        <div className="order-2 lg:order-1 lg:w-3/5">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={mvp}
            transition={{ duration: 0.6, ease: EASE }}
            className={`font-mono uppercase ${taglineColor}`}
            style={{ fontSize: 12, letterSpacing: "0.2em" }}
          >
            {num} — Servicio
          </motion.p>
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 22 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={mvp}
            transition={{ duration: 0.65, ease: EASE, delay: 0.05 }}
            className={`mt-5 font-playfair font-bold ${titleColor}`}
            style={{
              fontSize: "clamp(34px, 4.4vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {s.nombre}
          </motion.h2>
          {s.tagline && (
            <p className={`mt-4 font-playfair italic ${taglineColor}`} style={{ fontSize: "clamp(17px, 1.5vw, 22px)" }}>
              {s.tagline}
            </p>
          )}
          <div
            className={`mt-6 font-sans ${descColor}`}
            style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 620 }}
          >
            <RichText html={s.descripcion} className="rich-inline" />
          </div>

          {/* Sub-servicios como lista editorial con guiones largos */}
          <motion.ul
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={mvp}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="mt-10 flex flex-col gap-6"
          >
            {s.subServicios.map((sub, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="flex gap-4"
              >
                <span className={`select-none font-playfair ${taglineColor}`} style={{ fontSize: 22, lineHeight: 1.3 }}>
                  —
                </span>
                <div>
                  <p className={`font-sans font-semibold ${subTitleColor}`} style={{ fontSize: 16, lineHeight: 1.4 }}>
                    {sub.titulo}
                  </p>
                  <RichText
                    html={sub.desc}
                    className={`rich-inline mt-1 font-sans ${subDescColor}`}
                    style={{ fontSize: 14, lineHeight: 1.65 }}
                  />
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Número outline gigante (40%) */}
        <div className="order-1 flex justify-center lg:order-2 lg:w-2/5 lg:justify-end">
          <motion.span
            className="outline-number select-none font-playfair font-bold leading-none"
            aria-hidden
            style={{
              y: numY,
              fontSize: "clamp(120px, 22vw, 300px)",
              color: "transparent",
              WebkitTextStroke: `2px ${stroke}`,
              // @ts-expect-error vendor prop sin tipos en CSSProperties
              textStroke: `2px ${stroke}`,
              ["--fill" as string]: stroke,
            }}
          >
            {num}
          </motion.span>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 5 — CTA FINAL
   ════════════════════════════════════════════════════════════════════════ */

function FinalCTA({ cta }: { cta: Record<string, string> }) {
  const reduced = useReducedMotion()
  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-hueso text-center"
      style={{ padding: "120px clamp(24px, 6vw, 88px)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 100%, var(--color-arena) 0%, transparent 60%)",
        }}
      />
      <TextureOverlay texture="paperGrain" opacity={0.16} />

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 14 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mb-8 font-mono uppercase text-bordo"
        style={{ fontSize: 12, letterSpacing: "0.22em" }}
      >
        {cta.eyebrow}
      </motion.p>

      <motion.h2
        initial={reduced ? false : { opacity: 0, y: 26 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        className="relative font-playfair font-bold text-negro-bordo"
        style={{
          fontSize: "clamp(40px, 7vw, 110px)",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
          maxWidth: "16ch",
        }}
      >
        {cta.title_pre}{" "}
        <em className="text-bordo">{cta.title_accent}</em>
      </motion.h2>

      {cta.description && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={mvp}
          transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          className="relative mt-8 font-sans text-gris-bordo"
          style={{ fontSize: "clamp(16px, 1.5vw, 20px)", lineHeight: 1.65, maxWidth: 560 }}
        >
          <RichText html={cta.description} className="rich-inline" />
        </motion.div>
      )}

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={mvp}
        transition={{ duration: 0.6, ease: EASE, delay: 0.18 }}
        className="relative mt-12 w-full sm:w-auto"
      >
        <Link
          href="/#contacto"
          className="cta-final-btn group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-bordo font-sans font-semibold text-hueso transition-all duration-300 hover:bg-bordo-oscuro sm:w-auto"
          style={{ fontSize: "clamp(16px, 1.4vw, 20px)", padding: "clamp(18px,2.2vw,26px) clamp(36px,4vw,56px)" }}
        >
          {cta.button_text || "Conversemos"}
          <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </motion.div>
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
    SERVICE_KEYS.map((k) => [
      k,
      buildServicio(k, { ...fallbacksFor(k), ...content?.[k] }),
    ]),
  ) as Record<string, Servicio>

  const featured = byKey[featuredKey]
  const secondaries = SERVICE_KEYS.filter((k) => k !== featuredKey).map((k) => byKey[k])

  return (
    <>
      <HeroSection hero={hero} />
      <FeaturedSection s={featured} />
      {secondaries.map((s, i) => (
        <SecondarySection key={s.key} s={s} num={i === 0 ? "02" : "03"} dark={i === 1} />
      ))}
      <FinalCTA cta={cta} />
    </>
  )
}
