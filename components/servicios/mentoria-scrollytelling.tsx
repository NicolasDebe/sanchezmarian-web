"use client"

import { Fragment, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "motion/react"
import { useMediaQuery } from "@/lib/use-media-query"
import { RichText } from "@/components/ui/RichText"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { EASE, FEATURED_PHOTO, two, type Servicio, type SubServicio } from "./types"
import { MentoriaMobile } from "./mentoria-mobile"

/* ════════════════════════════════════════════════════════════════════════
   /servicios v4.4 — scrollytelling de Mentoría, arquitectura de 4 frames.
   Wrapper sticky 500vh; contenido sticky 100vh con offset bajo el nav.
   SOLO UN FRAME visible por vez (la foto persiste entre frames 2-3).
   Sin acumulación de sub-servicios, sin typography morph, indicador
   minimalista (progress bar + 4 dots).
   ════════════════════════════════════════════════════════════════════════ */

const NAV_H = 72 // header sticky bordo (h-[72px])
const OFFSET = NAV_H + 24 // 96px — respiro consciente bajo el nav

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/* Interpolación lineal por tramos sobre stops ascendentes. La usamos dentro de
   useTransform en su forma de FUNCIÓN (no la forma de arrays): en esta versión
   de motion la forma `useTransform(value, number[], number[])` no re-evalúa al
   scrollear, pero la forma de función sí. */
function piecewise(p: number, xs: number[], ys: number[]) {
  if (p <= xs[0]) return ys[0]
  const n = xs.length
  if (p >= xs[n - 1]) return ys[n - 1]
  for (let i = 1; i < n; i++) {
    if (p <= xs[i]) {
      const t = (p - xs[i - 1]) / (xs[i] - xs[i - 1])
      return ys[i - 1] + (ys[i] - ys[i - 1]) * t
    }
  }
  return ys[n - 1]
}

/* Orquestador: desktop scrollytelling, o bloques apilados en mobile /
   prefers-reduced-motion (sin secuestro de scroll). */
export function MentoriaScrollytelling({ s, sectionId, count }: { s: Servicio; sectionId: string; count: number }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const reduced = useReducedMotion()
  if (!s.nombre) return null // sin nombre no hay nada que contar
  if (isDesktop === true && !reduced) return <MentoriaDesktop s={s} sectionId={sectionId} count={count} />
  return <MentoriaMobile s={s} reduced={!!reduced} sectionId={sectionId} count={count} />
}

/* ════════════════════════════════════════════════════════════════════════
   DESKTOP
   ════════════════════════════════════════════════════════════════════════ */
function MentoriaDesktop({ s, sectionId, count }: { s: Servicio; sectionId: string; count: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const subs = s.subServicios
  const hasDesc = s.descripcion.trim() !== ""
  const SUB_START = 0.45
  const SUB_END = 0.85
  const n = Math.max(subs.length, 1)

  /* ── FRAME 1·2 — título grande centrado (estable, luego sube + achica) ── */
  const bigOpacity = useTransform(scrollYProgress, (p) => piecewise(p, [0, 0.25, 0.42, 0.45], [1, 1, 1, 0]))
  const bigScale = useTransform(scrollYProgress, (p) => piecewise(p, [0.25, 0.45], [1, 0.85]))
  const bigY = useTransform(scrollYProgress, (p) => `${piecewise(p, [0.25, 0.45], [0, -8])}vh`)

  /* contador "01 / 0X" + asterisco: viven con el frame de apertura */
  const decorOpacity = bigOpacity

  /* ── FRAME 3 — título compacto tipo header (arriba izquierda) ── */
  const compactOpacity = useTransform(scrollYProgress, (p) => piecewise(p, [0.43, 0.46, 0.85, 0.9], [0, 1, 1, 0]))
  const compactY = useTransform(scrollYProgress, (p) => piecewise(p, [0.85, 0.92], [0, -20]))

  /* ── FOTO — un único clip-path continuo a lo largo de los frames 2·3·4:
        circle reveal (2) → inset left strip (3) → cortinilla a la izq (4).
        En el límite 0.45, circle(110%) ≈ inset(0 0 0 0): ambos = imagen
        completa, así que el cambio de función no produce salto visible. ── */
  const clipPath = useTransform(scrollYProgress, (p) => {
    if (p < 0.45) {
      const t = clamp((p - 0.25) / 0.05, 0, 1) // 0.25 → 0.30, luego plateau
      return `circle(${t * 110}% at 50% 50%)`
    }
    if (p < 0.85) {
      const t = clamp((p - 0.45) / 0.05, 0, 1) // 0.45 → 0.50, luego plateau a 65%
      return `inset(0 ${t * 65}% 0 0)`
    }
    const t = clamp((p - 0.85) / 0.07, 0, 1) // 0.85 → 0.92: 65% → 100%
    return `inset(0 ${65 + t * 35}% 0 0)`
  })

  /* ── FRAME 4 — descripción word-by-word (activada por umbral) ── */
  const [descActive, setDescActive] = useState(false)
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const on = p >= 0.86
    if (on !== descActive) setDescActive(on)
  })

  return (
    <section id={sectionId} className="relative bg-hueso" aria-label={s.nombre} data-frames="4">
      <div ref={ref} style={{ height: "500vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* fondo + textura */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 100% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.45 }} />
          <TextureOverlay texture="paperGrain" opacity={0.12} />

          {/* FOTO (z-0) */}
          <motion.div className="absolute inset-0 z-0" style={{ clipPath, willChange: "clip-path" }}>
            <Image src={FEATURED_PHOTO} alt={s.nombre} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "center 22%" }} />
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--color-hueso) 0%, rgba(254,252,239,0.35) 35%, transparent 68%)" }} />
          </motion.div>

          {/* asterisco rotando — esquina superior derecha (frame 1·2) */}
          <motion.span aria-hidden className="pointer-events-none absolute z-10 select-none font-playfair text-dorado" style={{ top: "clamp(48px, 8vh, 96px)", right: "clamp(28px, 5vw, 80px)", fontSize: "clamp(40px, 5vw, 76px)", lineHeight: 1, opacity: decorOpacity }}>
            <span className="ms-asterisk inline-block" style={{ animationDuration: "40s" }}>✳</span>
          </motion.span>

          {/* contador "01 / 0X" — esquina inferior derecha (único indicador textual) */}
          <motion.div aria-hidden className="absolute z-10 font-mono text-bordo" style={{ bottom: 32, right: "clamp(28px, 5vw, 80px)", fontSize: 14, letterSpacing: "0.14em", opacity: decorOpacity }}>
            01 / {two(count)}
          </motion.div>

          {/* TÍTULO grande centrado (frames 1·2) */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" style={{ paddingTop: OFFSET, paddingInline: "clamp(24px, 6vw, 96px)" }}>
            <motion.div className="w-full text-center" style={{ maxWidth: 1200, opacity: bigOpacity, y: bigY, scale: bigScale, willChange: "transform, opacity" }}>
              <BigTitle text={s.nombre} />
            </motion.div>
          </div>

          {/* TÍTULO compacto tipo header (frame 3) — arriba a la izquierda */}
          <motion.div aria-hidden className="pointer-events-none absolute z-10" style={{ top: OFFSET, left: "clamp(24px, 6vw, 96px)", right: "clamp(24px, 6vw, 96px)", opacity: compactOpacity, y: compactY }}>
            <span className="block truncate font-playfair text-bordo" style={{ fontSize: "clamp(14px, 1.6vw, 22px)", fontWeight: 400, letterSpacing: "0.02em" }}>
              {s.nombre}
            </span>
          </motion.div>

          {/* SUB-SERVICIOS (frame 3) — uno por vez, reemplazo limpio */}
          {subs.length > 0 && (
            <div className="absolute z-10" style={{ top: OFFSET, bottom: 0, left: "38%", right: "clamp(40px, 6vw, 100px)" }}>
              {subs.map((sub, i) => (
                <SubItem
                  key={i}
                  sub={sub}
                  idx={i}
                  progress={scrollYProgress}
                  start={SUB_START + ((SUB_END - SUB_START) * i) / n}
                  end={SUB_START + ((SUB_END - SUB_START) * (i + 1)) / n}
                />
              ))}
            </div>
          )}

          {/* DESCRIPCIÓN completa (frame 4) — centrada */}
          {hasDesc && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" style={{ paddingTop: OFFSET, paddingInline: "clamp(24px, 6vw, 96px)" }}>
              <WordReveal html={s.descripcion} active={descActive} />
            </div>
          )}

          {/* INDICADOR — progress bar + 4 dots (absolute dentro del sticky:
              solo visible mientras la sección está pinneada) */}
          <ProgressIndicator progress={scrollYProgress} />
        </div>
      </div>
    </section>
  )
}

/* ── título grande: letter-by-letter agrupado por palabra ───────────────── */
const titleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
}
const titleLetter: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
}
function BigTitle({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <motion.h2
      aria-label={text}
      variants={titleContainer}
      initial="hidden"
      animate="visible"
      className="font-playfair text-negro-bordo"
      style={{ fontSize: "clamp(48px, 7vw, 104px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em", margin: 0 }}
    >
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block">
            {Array.from(w).map((c, ci) => (
              <motion.span key={ci} variants={titleLetter} className="inline-block" style={{ willChange: "transform, filter" }}>
                {c}
              </motion.span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.h2>
  )
}

/* ── sub-servicio: opacity plateau + translateY, sin overlap simultáneo ──── */
function SubItem({ sub, idx, progress, start, end }: { sub: SubServicio; idx: number; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, (p) => piecewise(p, [start, start + 0.02, end - 0.02, end], [0, 1, 1, 0]))
  const y = useTransform(progress, (p) => piecewise(p, [start, end], [40, -40]))
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center"
      style={{ opacity, y, maxWidth: 600, paddingRight: "clamp(16px, 3vw, 48px)", willChange: "opacity, transform" }}
    >
      <span className="font-mono text-bordo" style={{ fontSize: 12, letterSpacing: "0.22em" }}>{two(idx + 1)}</span>
      <div aria-hidden className="bg-dorado" style={{ width: 40, height: 2, marginTop: 16 }} />
      <p className="font-playfair text-bordo" style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em", marginTop: 24 }}>
        {sub.titulo}
      </p>
      {sub.desc && <RichText html={sub.desc} className="rich-inline font-sans text-gris-bordo" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 24, maxWidth: 540 }} />}
    </motion.div>
  )
}

/* ── descripción word-by-word (frame 4) ─────────────────────────────────── */
const wordContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const wordItem: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 8 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5, ease: EASE } },
}
function WordReveal({ html, active }: { html: string; active: boolean }) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const words = text.split(" ")
  return (
    <motion.p
      variants={wordContainer}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      className="text-center font-sans text-gris-bordo"
      style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 760 }}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={wordItem} className="inline-block" style={{ whiteSpace: "pre", willChange: "transform, filter" }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.p>
  )
}

/* ── indicador minimalista: barra vertical + relleno + 4 dots ────────────── */
const FRAME_BOUNDS = [0.25, 0.45, 0.85] // 4 frames → 3 cortes
function ProgressIndicator({ progress }: { progress: MotionValue<number> }) {
  const [frame, setFrame] = useState(0)
  useMotionValueEvent(progress, "change", (p) => {
    const f = p < FRAME_BOUNDS[0] ? 0 : p < FRAME_BOUNDS[1] ? 1 : p < FRAME_BOUNDS[2] ? 2 : 3
    if (f !== frame) setFrame(f)
  })
  return (
    <div aria-hidden className="absolute z-20" style={{ right: "clamp(16px, 2vw, 32px)", top: "50%", transform: "translateY(-50%)", width: 2, height: 240 }}>
      {/* riel */}
      <div className="absolute inset-0 rounded-full" style={{ background: "var(--color-dorado)", opacity: 0.2 }} />
      {/* relleno */}
      <motion.div className="absolute left-0 top-0 h-full w-full rounded-full" style={{ background: "var(--color-bordo)", scaleY: progress, transformOrigin: "top" }} />
      {/* dots por frame */}
      {[0, 1, 2, 3].map((i) => {
        const on = i === frame
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: "50%",
              top: `${(i / 3) * 100}%`,
              width: on ? 8 : 6,
              height: on ? 8 : 6,
              transform: "translate(-50%, -50%)",
              background: on ? "var(--color-bordo)" : "var(--color-dorado)",
              opacity: on ? 1 : 0.4,
              transition: "width 0.3s ease, height 0.3s ease, background 0.3s ease, opacity 0.3s ease",
            }}
          />
        )
      })}
    </div>
  )
}
