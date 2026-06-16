"use client"

import { Fragment, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
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
   MODELO DE FRAMES (dinámico — solo se incluyen frames con contenido real)
   ════════════════════════════════════════════════════════════════════════ */

type Stage = "opening" | "reveal" | "anchor" | "transition" | "sub" | "description"
type Frame = { stage: Stage; start: number; end: number; subIdx?: number }

function buildFrames(s: Servicio) {
  const items: { stage: Stage; weight: number; subIdx?: number }[] = []
  items.push({ stage: "opening", weight: 1.2 })
  items.push({ stage: "reveal", weight: 1.2 })
  if (s.anchorPhrase) items.push({ stage: "anchor", weight: 1.2 })
  items.push({ stage: "transition", weight: 1 })
  s.subServicios.forEach((_, i) => items.push({ stage: "sub", weight: 1.4, subIdx: i }))
  if (s.descripcion) items.push({ stage: "description", weight: 1.4 })

  const total = items.reduce((a, it) => a + it.weight, 0)
  let acc = 0
  const frames: Frame[] = items.map((it) => {
    const start = acc / total
    acc += it.weight
    return { stage: it.stage, start, end: acc / total, subIdx: it.subIdx }
  })

  const find = (st: Stage) => frames.find((f) => f.stage === st)
  const openEnd = find("opening")!.end
  const revealEnd = find("reveal")!.end
  const anchorFrame = find("anchor")
  const anchorEnd = anchorFrame ? anchorFrame.end : revealEnd
  const trans = find("transition")!
  const subFrames = frames.filter((f) => f.stage === "sub")
  const descFrame = find("description")

  return { frames, openEnd, revealEnd, anchorFrame, anchorEnd, trans, subFrames, descFrame }
}

/* arrays de stops estrictamente crecientes (motion exige input ascendente) */
function stops(pairs: [number, number][]): [number[], number[]] {
  const xs: number[] = []
  const ys: number[] = []
  for (const [x, y] of pairs) {
    if (xs.length === 0 || x > xs[xs.length - 1] + 1e-4) {
      xs.push(x)
      ys.push(y)
    } else {
      ys[ys.length - 1] = y // colapsa stops coincidentes conservando el último valor
    }
  }
  return [xs, ys]
}

/* ════════════════════════════════════════════════════════════════════════
   ORQUESTADOR — elige desktop scrollytelling o mobile apilado
   ════════════════════════════════════════════════════════════════════════ */

export function MentoriaScrollytelling({ s, sectionId }: { s: Servicio; sectionId: string }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const reduced = useReducedMotion()
  if (isDesktop === true && !reduced) return <MentoriaDesktop s={s} sectionId={sectionId} />
  return <MentoriaMobile s={s} reduced={!!reduced} sectionId={sectionId} />
}

/* ════════════════════════════════════════════════════════════════════════
   DESKTOP — sticky 800vh, apertura editorial + typography morph
   ════════════════════════════════════════════════════════════════════════ */

function MentoriaDesktop({ s, sectionId }: { s: Servicio; sectionId: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const M = useMemo(() => buildFrames(s), [s])
  const { frames, openEnd, revealEnd, anchorFrame, anchorEnd, trans, subFrames, descFrame } = M

  /* ── TYPOGRAPHY MORPH ──────────────────────────────────────────────────
     Playfair se carga como variable font AISLADA (var(--font-playfair-var),
     eje wght 400–900) solo para este título. Un ÚNICO elemento morfea:
       · peso vía font-variation-settings "wght" (900→700→500→400)
       · tamaño + posición vía transform scale/translateY (GPU, sin reflow)
       · letter-spacing
     Nota: el eje wght mínimo de Playfair es 400, así que el "300" del brief se
     mapea a 400 (el más liviano disponible). */
  const t0 = 0
  const tEnd = trans.end

  const [sizeX, sizeY] = stops([
    [t0, 1],
    [openEnd, 1],
    [revealEnd, 0.72],
    [anchorEnd, 0.5],
    [tEnd, 0.2],
    [1, 0.2],
  ])
  const scale = useTransform(scrollYProgress, sizeX, sizeY)

  const [tyX, tyY] = stops([
    [t0, 0],
    [openEnd, 0],
    [revealEnd, 0],
    [anchorEnd, -22],
    [tEnd, -38],
    [1, -38],
  ])
  const tyVh = useTransform(scrollYProgress, tyX, tyY)
  const translate = useMotionTemplate`translateY(${tyVh}vh) scale(${scale})`

  const [lsX, lsY] = stops([
    [t0, -0.02],
    [anchorEnd, -0.015],
    [tEnd, 0.03],
    [1, 0.03],
  ])
  const lsEm = useTransform(scrollYProgress, lsX, lsY)
  const letterSpacing = useMotionTemplate`${lsEm}em`

  const [wX, wY] = stops([
    [t0, 900],
    [openEnd, 900],
    [revealEnd, 700],
    [anchorEnd, 500],
    [tEnd, 400],
    [1, 400],
  ])
  const wght = useTransform(scrollYProgress, wX, wY)
  const fontVariationSettings = useMotionTemplate`"wght" ${wght}`

  /* ── FOTO ───────────────────────────────────────────────────────────────
     Reveal con clip-path circle, luego se compacta a la izquierda (scale +
     origin left), y sale como cortinilla en el frame de descripción. */
  const reveal = frames[1] // reveal es siempre el segundo frame
  const [crX, crY] = stops([
    [0, 0],
    [reveal.start, 0],
    [reveal.end, 115],
    [1, 115],
  ])
  const clipPct = useTransform(scrollYProgress, crX, crY)
  const clipPath = useMotionTemplate`circle(${clipPct}% at 50% 50%)`

  const descStart = descFrame ? descFrame.start : 1
  const descEnd = descFrame ? descFrame.end : 1

  const photoX = useTransform(
    scrollYProgress,
    ...stops([
      [0, 0],
      [trans.start, 0],
      [trans.end, 3],
      [descStart, 3],
      [descEnd, -45],
    ]),
  )
  const photoXvw = useMotionTemplate`${photoX}vw`
  const photoScale = useTransform(
    scrollYProgress,
    ...stops([
      [0, 1],
      [trans.start, 1],
      [trans.end, 0.55],
      [1, 0.55],
    ]),
  )
  const photoTransform = useMotionTemplate`translateX(${photoXvw}) scale(${photoScale})`
  const photoRadius = useTransform(scrollYProgress, ...stops([[trans.start, 0], [trans.end, 24], [1, 24]]))
  const photoOpacity = useTransform(scrollYProgress, ...stops([[0, 1], [descStart, 1], [descEnd, 0]]))
  const scrimOpacity = useTransform(
    scrollYProgress,
    ...stops([
      [reveal.start, 0.6],
      [reveal.end, 0.28],
      [anchorEnd, 0.16],
      [1, 0.16],
    ]),
  )

  /* asterisco: gira constante (CSS) + empujón extra acoplado al reveal */
  const astExtra = useTransform(scrollYProgress, [reveal.start, reveal.end], [0, 200])
  const decorOpacity = useTransform(scrollYProgress, ...stops([[0, 1], [trans.start, 1], [trans.end, 0]]))

  return (
    <section id={sectionId} className="relative bg-hueso" aria-label={s.nombre} data-frames={frames.length}>
      <div ref={ref} style={{ height: "800vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* fondo + textura */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 100% 0%, var(--color-arena) 0%, transparent 55%)", opacity: 0.45 }} />
          <TextureOverlay texture="paperGrain" opacity={0.12} />

          {/* FOTO (z bajo) */}
          <motion.div className="absolute inset-0" style={{ clipPath, opacity: photoOpacity, transformOrigin: "0% 50%", transform: photoTransform, willChange: "transform, clip-path" }}>
            <motion.div className="absolute inset-0 overflow-hidden" style={{ borderRadius: photoRadius }}>
              <Image src={FEATURED_PHOTO} alt={s.nombre} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "center 22%" }} />
              <motion.div className="absolute inset-0" style={{ opacity: scrimOpacity, background: "linear-gradient(180deg, var(--color-hueso) 0%, rgba(254,252,239,0.35) 38%, transparent 70%)" }} />
            </motion.div>
          </motion.div>

          {/* asterisco decorativo arriba a la derecha */}
          <motion.span aria-hidden className="pointer-events-none absolute select-none font-playfair text-dorado" style={{ top: "clamp(48px, 8vh, 96px)", right: "clamp(28px, 5vw, 80px)", fontSize: "clamp(40px, 5vw, 76px)", lineHeight: 1, rotate: astExtra, opacity: decorOpacity }}>
            <span className="ms-asterisk inline-block" style={{ animationDuration: "40s" }}>✳</span>
          </motion.span>

          {/* contador "01 / MENTORÍA" abajo a la derecha */}
          <motion.div aria-hidden className="absolute text-right" style={{ bottom: "clamp(28px, 5vh, 56px)", right: "clamp(28px, 5vw, 80px)", opacity: decorOpacity }}>
            <div className="font-mono text-bordo" style={{ fontSize: 14, letterSpacing: "0.12em" }}>01</div>
            <div className="mt-1 font-mono uppercase text-gris-bordo" style={{ fontSize: 11, letterSpacing: "0.28em" }}>{firstWord(s.nombre)}</div>
          </motion.div>

          {/* TÍTULO que morfea (z medio) — aparece UNA sola vez, un solo elemento */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ paddingInline: "clamp(24px, 6vw, 96px)" }}>
            <motion.div
              className="relative w-full text-center"
              style={{ maxWidth: 1150, transform: translate, transformOrigin: "50% 50%", letterSpacing, fontVariationSettings, fontFamily: "var(--font-playfair-var), serif", willChange: "transform" }}
            >
              <MorphTitle text={s.nombre} />
            </motion.div>
          </div>

          {/* FRASE ANCLA (frame propio, parallax contrario) */}
          {anchorFrame && (
            <AnchorFrame phrase={s.anchorPhrase} progress={scrollYProgress} frame={anchorFrame} />
          )}

          {/* PANEL DE SUB-SERVICIOS (derecha, acumulativo) */}
          {subFrames.length > 0 && (
            <SubPanel subs={s.subServicios} subFrames={subFrames} progress={scrollYProgress} startReveal={trans.end} fadeOut={descStart} />
          )}

          {/* DESCRIPCIÓN COMPLETA (centro, cierre) */}
          {descFrame && <DescriptionFrame html={s.descripcion} progress={scrollYProgress} frame={descFrame} />}
        </div>
      </div>
    </section>
  )
}

function firstWord(name: string) {
  return (name.split(/\s+/)[0] ?? "").toUpperCase()
}

/* ── título único: entrada letter-by-letter agrupada por palabra ─────────
   Las palabras son inline-block (no se parten) y se separan por un espacio
   real → el wrapping es por palabra y estable mientras el peso morfea. */
const titleContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025, delayChildren: 0.1 } },
}
const titleLetter: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
}

function MorphTitle({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <motion.h2
      aria-label={text}
      variants={titleContainer}
      initial="hidden"
      animate="visible"
      className="text-negro-bordo"
      style={{ fontSize: "clamp(40px, 6.2vw, 100px)", lineHeight: 0.98, margin: 0 }}
    >
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block align-baseline">
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

/* ── frame de frase ancla ───────────────────────────────────────────────── */
function AnchorFrame({ phrase, progress, frame }: { phrase: string; progress: MotionValue<number>; frame: Frame }) {
  const { start, end } = frame
  const span = end - start
  const opacity = useTransform(progress, [start, start + span * 0.25, end - span * 0.1, end], [0, 1, 1, 0])
  const blur = useTransform(progress, [start, start + span * 0.3], [20, 0])
  const filter = useMotionTemplate`blur(${blur}px)`
  // parallax CONTRARIO: mientras todo sube, la frase flota hacia abajo→arriba
  const y = useTransform(progress, [start, end], [80, -40])
  const words = phrase.split(/\s+/).filter(Boolean)
  return (
    <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ opacity, paddingInline: "clamp(24px, 6vw, 96px)", willChange: "opacity, transform" }}>
      <motion.p className="text-center font-playfair italic text-dorado" style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 1.1, fontWeight: 400, maxWidth: 1100, y, filter }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre" }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </motion.p>
    </motion.div>
  )
}

/* ── panel de sub-servicios acumulativo (derecha) ─────────────────────────
   State-driven (no scroll-scrub de opacity): un useMotionValueEvent calcula
   el sub activo según el frame que contiene el progress, y cada item anima
   con motion estándar (entra / queda atenuado al pasar al siguiente). */
function SubPanel({ subs, subFrames, progress, startReveal, fadeOut }: { subs: SubServicio[]; subFrames: Frame[]; progress: MotionValue<number>; startReveal: number; fadeOut: number }) {
  const [active, setActive] = useState(-1)
  const [shown, setShown] = useState(false)
  useMotionValueEvent(progress, "change", (p) => {
    const nextShown = p >= startReveal - 0.02 && p < fadeOut
    if (nextShown !== shown) setShown(nextShown)
    let idx = -1
    for (let i = 0; i < subFrames.length; i++) if (p >= subFrames[i].start) idx = i
    if (p >= fadeOut) idx = subFrames.length - 1
    if (idx !== active) setActive(idx)
  })
  return (
    <motion.div
      className="absolute inset-y-0 flex flex-col justify-center"
      style={{ left: "60%", right: "clamp(56px, 6vw, 100px)", gap: 26 }}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {subs.map((sub, i) => (
        <SubItem key={i} sub={sub} idx={i} active={active} />
      ))}
    </motion.div>
  )
}

function SubItem({ sub, idx, active }: { sub: SubServicio; idx: number; active: number }) {
  const reduced = useReducedMotion()
  const state = idx > active ? "pending" : idx === active ? "active" : "passed"
  const variants: Variants = {
    pending: { opacity: 0, y: 40, scale: 1, filter: "blur(8px)" },
    active: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    passed: { opacity: 0.32, y: 0, scale: 0.97, filter: "blur(0px)" },
  }
  return (
    <motion.div
      variants={reduced ? undefined : variants}
      initial={reduced ? undefined : "pending"}
      animate={reduced ? undefined : state}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ transformOrigin: "0% 50%", willChange: "opacity, transform", opacity: reduced ? (state === "pending" ? 0 : 1) : undefined }}
    >
      <span className="font-mono uppercase text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em" }}>{two(idx + 1)} — Sub-servicio</span>
      <motion.div
        className="mt-3 mb-4 h-px bg-dorado"
        animate={{ width: state === "pending" ? 0 : 40 }}
        transition={{ duration: 0.5, ease: EASE, delay: state === "active" ? 0.1 : 0 }}
        style={{ width: 0 }}
      />
      <p className="font-playfair font-bold text-bordo" style={{ fontSize: "clamp(28px, 3.2vw, 52px)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>{sub.titulo}</p>
      {sub.desc && <RichText html={sub.desc} className="rich-inline mt-4 font-sans text-gris-bordo" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 540 }} />}
    </motion.div>
  )
}

/* ── frame de descripción completa (cierre) ─────────────────────────────── */
function DescriptionFrame({ html, progress, frame }: { html: string; progress: MotionValue<number>; frame: Frame }) {
  const { start } = frame
  const [active, setActive] = useState(false)
  useMotionValueEvent(progress, "change", (v) => {
    const on = v >= start - 0.01
    if (on !== active) setActive(on)
  })
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ paddingInline: "clamp(24px, 6vw, 96px)", willChange: "opacity" }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <WordReveal html={html} active={active} />
    </motion.div>
  )
}

const wordContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }
const wordItem: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 8 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5, ease: EASE } },
}

function WordReveal({ html, active }: { html: string; active: boolean }) {
  // texto plano para el reveal palabra-por-palabra (la descripción es 1 párrafo)
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const words = text.split(" ")
  return (
    <motion.p
      variants={wordContainer}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      className="text-center font-sans text-gris-bordo"
      style={{ fontSize: 18, lineHeight: 1.7, letterSpacing: "0.01em", maxWidth: 720 }}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={wordItem} className="inline-block" style={{ whiteSpace: "pre", willChange: "transform, filter" }}>
          {w}{i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.p>
  )
}
