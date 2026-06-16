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
   TIPOS Y PARSEO
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
  introText: string
  testimonial: string
  testimonialAuthor: string
}

const SERVICE_KEYS = ["servicio_01", "servicio_02", "servicio_03"] as const
const FEATURED_PHOTO = "/images/NAC_4230.jpg"
const EASE = [0.22, 1, 0.36, 1] as const

function buildServicio(key: string, c: Record<string, string>): Servicio {
  const subServicios = [1, 2, 3]
    .map((n) => ({ titulo: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((s) => s.titulo.trim() !== "")
  return {
    key,
    nombre: (c.name ?? "").trim(),
    tagline: (c.tagline ?? "").trim(),
    descripcion: (c.description ?? "").trim(),
    subServicios,
    cta: (c.cta_text ?? "").trim() || "Quiero este servicio",
    anchorPhrase: (c.anchor_phrase ?? "").trim(),
    introText: (c.intro_text ?? "").trim(),
    testimonial: (c.testimonial ?? "").trim(),
    testimonialAuthor: (c.testimonial_author ?? "").trim(),
  }
}

const two = (n: number) => (n < 10 ? `0${n}` : `${n}`)

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 1 — HERO (v4.1 — contenido + satélites)
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

        <motion.h1 variants={reduced ? undefined : heroContainer} initial={reduced ? undefined : "hidden"} animate={reduced ? undefined : "visible"} className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(36px, 5.4vw, 88px)", lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "18ch" }}>
          {reduced ? hero.h1 : words.map((w, i) => (
            <motion.span key={i} variants={heroWord} className="inline-block" style={{ marginRight: "0.25em", willChange: "transform, filter" }}>{w}</motion.span>
          ))}
        </motion.h1>

        <motion.div {...satellite(0.15)} className="mt-8 font-sans text-gris-bordo" style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.6, maxWidth: 560 }}>
          <RichText html={hero.description} className="rich-inline" />
        </motion.div>
      </div>

      <motion.span aria-hidden {...satellite(0.25)} className="absolute font-mono uppercase text-bordo/55" style={{ bottom: 36, right: "clamp(28px, 6vw, 96px)", fontSize: 11, letterSpacing: "0.22em" }}>
        {two(serviceCount)} — {eyebrow}
      </motion.span>

      <div aria-hidden className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3" style={{ bottom: 30 }}>
        <span className="font-mono uppercase text-bordo/60" style={{ fontSize: 10, letterSpacing: "0.3em", writingMode: "vertical-rl" }}>Scroll</span>
        <div className="relative flex h-9 w-5 items-start justify-center rounded-full border border-dorado/50 pt-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-dorado", !reduced && "ms-scroll-dot")} />
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 2 — SERVICIO DESTACADO (scrollytelling solo Mentoría)
   ════════════════════════════════════════════════════════════════════════ */

type Frame =
  | { kind: "photo"; range: [number, number] }
  | { kind: "anchor"; range: [number, number] }
  | { kind: "sub"; range: [number, number]; sub: SubServicio; idx: number }
  | { kind: "close"; range: [number, number] }

function buildFeaturedFrames(f: Servicio): { frames: Frame[]; nSub: number } {
  const subs = f.subServicios.slice(0, 3)
  const items: { kind: Frame["kind"]; weight: number; sub?: SubServicio; idx?: number }[] = []
  items.push({ kind: "photo", weight: 1 })
  if (f.anchorPhrase) items.push({ kind: "anchor", weight: 1.5 })
  subs.forEach((sub, i) => items.push({ kind: "sub", weight: 2, sub, idx: i }))
  items.push({ kind: "close", weight: 1.5 })

  const total = items.reduce((a, it) => a + it.weight, 0)
  let acc = 0
  const frames = items.map((it) => {
    const s = acc / total
    acc += it.weight
    const e = acc / total
    if (it.kind === "sub") return { kind: "sub", range: [s, e], sub: it.sub!, idx: it.idx! } as Frame
    return { kind: it.kind, range: [s, e] } as Frame
  })
  return { frames, nSub: subs.length }
}

function FeaturedBlock({ s }: { s: Servicio }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reduced = useReducedMotion()
  if (isDesktop === true && !reduced) return <FeaturedDesktop s={s} />
  return <FeaturedMobile s={s} reduced={!!reduced} />
}

/* ─── desktop sticky 600vh ─────────────────────────────────────────────── */
function FeaturedDesktop({ s }: { s: Servicio }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const { frames, nSub } = buildFeaturedFrames(s)
  const fotoRange = frames[0].range
  const photoScale = useTransform(scrollYProgress, [0, fotoRange[1]], [1.06, 1])

  return (
    <section className="relative bg-hueso" aria-label={s.nombre}>
      <div ref={ref} style={{ height: "600vh" }}>
        <div className="sticky top-0 flex h-screen items-stretch overflow-hidden">
          {/* PANEL IZQUIERDO (30%) — indicador editorial, sin título de servicio */}
          <div className="relative flex w-[30%] flex-col justify-center" style={{ paddingInline: "clamp(32px, 4vw, 72px)" }}>
            <p className="font-mono uppercase text-bordo" style={{ fontSize: 12, letterSpacing: "0.2em" }}>
              01 — Servicio destacado
            </p>
            <div className="mt-6 h-px w-16 bg-dorado" />

            {/* zona cambiante: intro (foto) + contadores (subs) */}
            <div className="relative mt-10" style={{ minHeight: 180 }}>
              {s.introText && (
                <LeftLayer progress={scrollYProgress} range={fotoRange} first>
                  <p className="font-playfair italic text-gris-bordo" style={{ fontSize: "clamp(20px, 1.7vw, 26px)", lineHeight: 1.35, maxWidth: 320 }}>
                    {s.introText}
                  </p>
                </LeftLayer>
              )}
              {frames.map((f, i) =>
                f.kind === "sub" ? (
                  <LeftLayer key={i} progress={scrollYProgress} range={f.range}>
                    <div className="flex items-baseline gap-3 font-playfair font-bold text-negro-bordo leading-none">
                      <span style={{ fontSize: "clamp(80px, 9vw, 150px)" }}>{two(f.idx + 1)}</span>
                      <span className="text-bordo/40" style={{ fontSize: "clamp(28px, 3vw, 48px)" }}>/ {two(nSub)}</span>
                    </div>
                  </LeftLayer>
                ) : null,
              )}
            </div>
          </div>

          {/* PANEL DERECHO (70%) — frames (acá vive el TÍTULO) */}
          <div className="relative w-[70%] overflow-hidden">
            {frames.map((f, i) => {
              const first = i === 0
              const last = i === frames.length - 1
              if (f.kind === "photo")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} first>
                    <div className="relative h-full w-full">
                      <motion.div className="absolute inset-0" style={{ scale: photoScale }}>
                        <Image src={FEATURED_PHOTO} alt={s.nombre} fill sizes="70vw" className="object-cover" loading="lazy" />
                      </motion.div>
                      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,0,8,0.05) 0%, rgba(26,0,8,0.25) 55%, rgba(26,0,8,0.78) 100%)" }} />
                      <TextureOverlay texture="paperGrain" opacity={0.14} />
                      <div className="absolute inset-x-0 bottom-0" style={{ padding: "clamp(40px, 5vw, 72px)" }}>
                        <h2 className="font-playfair font-bold text-hueso" style={{ fontSize: "clamp(34px, 3.8vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: 760 }}>
                          {s.nombre}
                        </h2>
                        {s.tagline && (
                          <p className="mt-4 font-playfair italic text-dorado" style={{ fontSize: "clamp(18px, 1.5vw, 24px)" }}>{s.tagline}</p>
                        )}
                        {s.descripcion && (
                          <div className="mt-5 font-sans text-hueso/85" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 620 }}>
                            <RichText html={s.descripcion} className="rich-inline" />
                          </div>
                        )}
                      </div>
                    </div>
                  </FrameLayer>
                )
              if (f.kind === "anchor")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} className="flex items-center bg-arena" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                    <p className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(40px, 5vw, 80px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                      {s.anchorPhrase}
                    </p>
                  </FrameLayer>
                )
              if (f.kind === "sub")
                return (
                  <FrameLayer key={i} progress={scrollYProgress} range={f.range} className="flex items-center justify-center bg-hueso-oscuro" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                    <SubCard sub={f.sub} />
                  </FrameLayer>
                )
              // close
              return (
                <FrameLayer key={i} progress={scrollYProgress} range={f.range} last={last} className="flex flex-col items-start justify-center bg-bordo" style={{ paddingInline: "clamp(40px, 5vw, 80px)" }}>
                  {s.testimonial ? (
                    <figure className="rounded-3xl bg-hueso/10 p-9" style={{ maxWidth: 560, border: "1px solid rgba(254,252,239,0.18)" }}>
                      <blockquote className="font-playfair italic text-hueso" style={{ fontSize: "clamp(22px, 2vw, 30px)", lineHeight: 1.4 }}>“{s.testimonial}”</blockquote>
                      {s.testimonialAuthor && (
                        <figcaption className="mt-5 font-mono uppercase text-dorado" style={{ fontSize: 11, letterSpacing: "0.18em" }}>{s.testimonialAuthor}</figcaption>
                      )}
                    </figure>
                  ) : (
                    s.tagline && (
                      <p className="font-playfair italic text-hueso/80" style={{ fontSize: "clamp(26px, 2.6vw, 44px)", lineHeight: 1.25, maxWidth: 620 }}>{s.tagline}</p>
                    )
                  )}
                  <Link href="/#contacto" className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-hueso px-8 py-4 font-sans font-semibold text-bordo transition-all duration-300 hover:bg-arena" style={{ fontSize: 15 }}>
                    Conversemos
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </Link>
                </FrameLayer>
              )
            })}

            <ProgressDots frames={frames} progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* capas con plateau (dominio completo [0,1] — motion v12 no clampea) */
function FrameLayer({ progress, range, first, last, className, style, children }: {
  progress: MotionValue<number>; range: [number, number]; first?: boolean; last?: boolean; className?: string; style?: React.CSSProperties; children: React.ReactNode
}) {
  const [s, e] = range
  const f = 0.03
  const input = first ? [0, e - f, e, 1] : last ? [0, s, s + f, 1] : [0, s, s + f, e - f, e, 1]
  const out = first ? [1, 1, 0, 0] : last ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0]
  const opacity = useTransform(progress, input, out)
  return (
    <motion.div className={cn("absolute inset-0", className)} style={{ opacity, willChange: "opacity", ...style }}>
      {children}
    </motion.div>
  )
}

/* panel izquierdo: cross-fade + slide + blur (counter feel) */
function LeftLayer({ progress, range, first, last, children }: {
  progress: MotionValue<number>; range: [number, number]; first?: boolean; last?: boolean; children: React.ReactNode
}) {
  const [s, e] = range
  const f = 0.04
  const input = first ? [0, e - f, e, 1] : last ? [0, s, s + f, 1] : [0, s, s + f, e - f, e, 1]
  const opacity = useTransform(progress, input, first ? [1, 1, 0, 0] : last ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0])
  const y = useTransform(progress, input, first ? [0, 0, -26, -26] : last ? [30, 30, 0, 0] : [30, 30, 0, 0, -26, -26])
  const filter = useTransform(progress, input, first ? ["blur(0px)", "blur(0px)", "blur(8px)", "blur(8px)"] : last ? ["blur(8px)", "blur(8px)", "blur(0px)", "blur(0px)"] : ["blur(8px)", "blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)", "blur(8px)"])
  return (
    <motion.div className="absolute inset-0 flex flex-col justify-start" style={{ opacity, y, filter, willChange: "opacity, transform" }}>
      {children}
    </motion.div>
  )
}

function SubCard({ sub }: { sub: SubServicio }) {
  return (
    <div className="ms-breathe rounded-3xl bg-hueso p-10 shadow-[0_24px_70px_-28px_rgba(102,0,31,0.45)]" style={{ maxWidth: 480, border: "1px solid rgba(201,168,130,0.45)" }}>
      <span className="font-mono uppercase text-bordo/60" style={{ fontSize: 11, letterSpacing: "0.18em" }}>Sub-servicio</span>
      <p className="mt-4 font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(24px, 2.2vw, 34px)", lineHeight: 1.15 }}>{sub.titulo}</p>
      {sub.desc && <RichText html={sub.desc} className="rich-inline mt-4 font-sans text-gris-bordo" style={{ fontSize: 16, lineHeight: 1.6 }} />}
    </div>
  )
}

function ProgressDots({ frames, progress }: { frames: Frame[]; progress: MotionValue<number> }) {
  return (
    <div className="absolute right-8 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-4">
      <div className="absolute top-0 h-full w-px bg-dorado/25" />
      {frames.map((f, i) => (
        <Dot key={i} progress={progress} range={f.range} />
      ))}
    </div>
  )
}

function Dot({ progress, range }: { progress: MotionValue<number>; range: [number, number] }) {
  const [s, e] = range
  const mid = (s + e) / 2
  const a = Math.max(s, 0.0001)
  const b = Math.min(e, 0.9999)
  const scale = useTransform(progress, [0, a, mid, b, 1], [1, 1, 1.7, 1, 1])
  const bg = useTransform(progress, [0, a, mid, b, 1], ["#C9A882", "#C9A882", "#66001F", "#C9A882", "#C9A882"])
  return (
    <motion.span className="relative z-10 rounded-full" style={{ width: 9, height: 9, scale, backgroundColor: bg }} />
  )
}

/* ─── mobile: bloques apilados ─────────────────────────────────────────── */
const mvp = { once: true, margin: "-60px" } as const
const springIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
}

function FeaturedMobile({ s, reduced }: { s: Servicio; reduced: boolean }) {
  const anim = reduced ? {} : { variants: springIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp }
  return (
    <section className="bg-hueso" aria-label={s.nombre}>
      <div style={{ padding: "80px 24px 36px" }}>
        <p className="font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em" }}>01 — Servicio destacado</p>
        <div className="mt-4 mb-6 h-px w-16 bg-dorado" />
        <h2 className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(32px, 9vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em" }}>{s.nombre}</h2>
        {s.tagline && <p className="mt-4 font-playfair italic text-bordo" style={{ fontSize: 19 }}>{s.tagline}</p>}
        {s.descripcion && <div className="mt-5 font-sans text-gris-bordo" style={{ fontSize: 16, lineHeight: 1.6 }}><RichText html={s.descripcion} className="rich-inline" /></div>}
      </div>

      <motion.div {...anim} className="relative mx-6 overflow-hidden rounded-2xl" style={{ aspectRatio: "4 / 5" }}>
        <Image src={FEATURED_PHOTO} alt={s.nombre} fill sizes="100vw" className="object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(102,0,31,0.35), transparent 60%)" }} />
      </motion.div>

      {s.anchorPhrase && (
        <div className="mt-10 bg-arena" style={{ padding: "72px 24px" }}>
          <motion.p {...anim} className="font-playfair font-bold text-negro-bordo" style={{ fontSize: "clamp(30px, 8vw, 44px)", lineHeight: 1.12, letterSpacing: "-0.02em" }}>{s.anchorPhrase}</motion.p>
        </div>
      )}

      <div style={{ padding: "56px 24px 8px" }}>
        <p className="mb-6 font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.18em" }}>Sub-servicios</p>
        <div className="flex flex-col" style={{ gap: 20 }}>
          {s.subServicios.map((sub, i) => (
            <motion.div key={i} {...(reduced ? {} : { variants: springIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp })} className="rounded-2xl bg-hueso-oscuro p-7" style={{ border: "1px solid rgba(201,168,130,0.4)" }}>
              <span className="font-mono uppercase text-bordo/60" style={{ fontSize: 10, letterSpacing: "0.18em" }}>{two(i + 1)} / {two(s.subServicios.length)}</span>
              <p className="mt-3 font-playfair font-bold text-negro-bordo" style={{ fontSize: 22, lineHeight: 1.2 }}>{sub.titulo}</p>
              {sub.desc && <RichText html={sub.desc} className="rich-inline mt-3 font-sans text-gris-bordo" style={{ fontSize: 14.5, lineHeight: 1.6 }} />}
            </motion.div>
          ))}
        </div>
      </div>

      {s.testimonial && (
        <div className="mt-10 bg-bordo" style={{ padding: "64px 24px" }}>
          <motion.figure {...anim} className="rounded-2xl bg-hueso/10 p-7" style={{ border: "1px solid rgba(254,252,239,0.18)" }}>
            <blockquote className="font-playfair italic text-hueso" style={{ fontSize: "clamp(20px, 5.5vw, 26px)", lineHeight: 1.4 }}>“{s.testimonial}”</blockquote>
            {s.testimonialAuthor && <figcaption className="mt-4 font-mono uppercase text-dorado" style={{ fontSize: 11, letterSpacing: "0.18em" }}>{s.testimonialAuthor}</figcaption>}
          </motion.figure>
        </div>
      )}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 3 — TRANSICIÓN CONCEPTUAL
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
        /* Divisor decorativo cuando no hay frase aprobada */
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
   SECCIONES 4 y 5 — SERVICIOS SECUNDARIOS (single-column manifiesto)
   ════════════════════════════════════════════════════════════════════════ */
function SingleColumnService({ s, num, dark }: { s: Servicio; num: string; dark: boolean }) {
  const reduced = useReducedMotion()
  const bg = dark ? "bg-bordo" : "bg-hueso"
  const titleColor = dark ? "text-hueso" : "text-negro-bordo"
  const accent = dark ? "text-dorado" : "text-bordo"
  const descColor = dark ? "text-hueso/85" : "text-gris-bordo"
  const subTitle = dark ? "text-hueso" : "text-negro-bordo"
  const subDesc = dark ? "text-hueso/75" : "text-gris-bordo"
  const lineColor = dark ? "rgba(254,252,239,0.25)" : "rgba(201,168,130,0.4)"
  const pillBorder = dark ? "rgba(254,252,239,0.5)" : "rgba(201,168,130,0.7)"

  const item = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: mvp, transition: { duration: 0.6, ease: EASE, delay } }

  return (
    <section className={cn("overflow-hidden", bg)} aria-label={s.nombre} style={{ padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)" }}>
      <div className="mx-auto" style={{ maxWidth: 900 }}>
        <motion.div {...item(0)}>
          <span className={cn("inline-flex items-center rounded-full font-mono uppercase", accent)} style={{ fontSize: 11, letterSpacing: "0.2em", padding: "10px 18px", border: `1px solid ${pillBorder}` }}>
            {num} — Servicio
          </span>
        </motion.div>

        <motion.h2 {...item(0.05)} className={cn("mt-8 font-playfair font-bold", titleColor)} style={{ fontSize: "clamp(40px, 6vw, 88px)", lineHeight: 1.04, letterSpacing: "-0.03em" }}>
          {s.nombre}
        </motion.h2>

        {s.tagline && (
          <motion.p {...item(0.1)} className={cn("mt-5 font-playfair italic", accent)} style={{ fontSize: "clamp(18px, 1.6vw, 24px)" }}>
            {s.tagline}
          </motion.p>
        )}

        {s.descripcion && (
          <motion.div {...item(0.15)} className={cn("mt-7 font-sans", descColor)} style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720 }}>
            <RichText html={s.descripcion} className="rich-inline" />
          </motion.div>
        )}

        {s.subServicios.length > 0 && (
          <div className="mt-16 flex flex-col">
            {s.subServicios.map((sub, i) => (
              <motion.div key={i} {...item(0.1 + i * 0.06)} className="flex flex-col" style={{ paddingBlock: 48, borderTop: i === 0 ? "none" : `1px solid ${lineColor}` }}>
                <div className="flex items-baseline gap-4">
                  <span className={cn("font-mono", accent)} style={{ fontSize: 13 }}>{two(i + 1)}</span>
                  <p className={cn("font-playfair font-bold", subTitle)} style={{ fontSize: "clamp(22px, 2.4vw, 30px)", lineHeight: 1.2 }}>{sub.titulo}</p>
                </div>
                {sub.desc && (
                  <RichText html={sub.desc} className={cn("rich-inline mt-3 font-sans", subDesc)} style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 680, marginLeft: 36 }} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div {...item(0.1)} className="mt-14">
          <Link href="/#contacto" className={cn("group inline-flex items-center gap-2 rounded-xl px-9 py-4 font-sans font-semibold transition-all duration-300", dark ? "bg-hueso text-bordo hover:bg-arena" : "bg-bordo text-hueso hover:bg-bordo-oscuro")} style={{ fontSize: 15 }}>
            {s.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECCIÓN 6 — CTA FINAL (full-bleed --bordo, centrado)
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
    cta?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const cta = { ...fallbacksFor("cta"), ...content?.cta }
  const transitionPhrase = ({ ...fallbacksFor("transition"), ...content?.transition }.phrase ?? "").trim()

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
      <FeaturedBlock s={featured} />
      <TransitionSection phrase={transitionPhrase} />
      {secondaries.map((s, i) => (
        <SingleColumnService key={s.key} s={s} num={i === 0 ? "02" : "03"} dark={i === 1} />
      ))}
      <FinalCTA cta={cta} />
    </>
  )
}
