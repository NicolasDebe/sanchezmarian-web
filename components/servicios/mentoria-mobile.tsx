"use client"

import { Fragment } from "react"
import Image from "next/image"
import { motion, type Variants } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { cn } from "@/lib/utils"
import { EASE, FEATURED_PHOTO, two, type Servicio, type SubServicio } from "./types"

/* ════════════════════════════════════════════════════════════════════════
   MOBILE (< 768px) — traducción de los 4 frames a bloques verticales
   apilados. Sin sticky, sin secuestro de scroll. Indicador lateral oculto.
   ════════════════════════════════════════════════════════════════════════ */

const NAV_H = 72
const mvp = { once: true, margin: "-50px" } as const

export function MentoriaMobile({ s, reduced, sectionId, count }: { s: Servicio; reduced: boolean; sectionId: string; count: number }) {
  return (
    <section id={sectionId} className="bg-hueso" aria-label={s.nombre} data-frames="4">
      <OpeningBlock title={s.nombre} count={count} reduced={reduced} />
      <PhotoBlock alt={s.nombre} reduced={reduced} />
      {s.subServicios.length > 0 && <SubBlock subs={s.subServicios} reduced={reduced} />}
      {s.descripcion && <ClosingBlock html={s.descripcion} reduced={reduced} />}
    </section>
  )
}

/* ── Bloque 1 — apertura tipográfica ────────────────────────────────────── */
const letterContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }
const letter: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
}
function OpeningBlock({ title, count, reduced }: { title: string; count: number; reduced: boolean }) {
  const words = title.split(/\s+/).filter(Boolean)
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden" style={{ padding: `${NAV_H + 32}px 24px 56px` }}>
      <span aria-hidden className={cn("pointer-events-none absolute select-none font-playfair text-dorado", !reduced && "ms-asterisk")} style={{ top: NAV_H + 8, right: 24, fontSize: "clamp(36px, 12vw, 60px)", lineHeight: 1, animationDuration: "40s" }}>✳</span>
      <motion.h2
        aria-label={title}
        variants={reduced ? undefined : letterContainer}
        initial={reduced ? undefined : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={mvp}
        className="text-center font-playfair text-negro-bordo"
        style={{ fontSize: "clamp(36px, 10vw, 64px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}
      >
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span aria-hidden className="inline-block">
              {Array.from(w).map((c, ci) => (
                <motion.span key={ci} variants={reduced ? undefined : letter} className="inline-block">{c}</motion.span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.h2>
      <div aria-hidden className="absolute font-mono text-bordo" style={{ bottom: 28, fontSize: 13, letterSpacing: "0.14em" }}>01 / {two(count)}</div>
    </div>
  )
}

/* ── Bloque 2 — foto con reveal al entrar al viewport ───────────────────── */
function PhotoBlock({ alt, reduced }: { alt: string; reduced: boolean }) {
  return (
    <div className="px-6" style={{ paddingBlock: "20px 12px" }}>
      <motion.div
        {...(reduced
          ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: mvp, transition: { duration: 0.5 } }
          : { initial: { clipPath: "circle(0% at 50% 50%)" }, whileInView: { clipPath: "circle(75% at 50% 50%)" }, viewport: mvp, transition: { duration: 1.1, ease: EASE } })}
        className="relative overflow-hidden rounded-2xl"
        style={{ height: "58vh" }}
      >
        <Image src={FEATURED_PHOTO} alt={alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: "center 22%" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(102,0,31,0.25), transparent 60%)" }} />
      </motion.div>
    </div>
  )
}

/* ── Bloque 3 — sub-servicios como cards apiladas full-width ─────────────── */
const cardIn: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18 } },
}
function SubBlock({ subs, reduced }: { subs: SubServicio[]; reduced: boolean }) {
  return (
    <div style={{ padding: "8px 24px 16px" }}>
      {subs.map((sub, i) => (
        <Fragment key={i}>
          {i > 0 && <div aria-hidden className="bg-dorado/40" style={{ height: 1, width: "100%" }} />}
          <motion.div
            {...(reduced
              ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: mvp, transition: { duration: 0.5 } }
              : { variants: cardIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp })}
            style={{ padding: "40px 0" }}
          >
            <span className="font-mono text-bordo" style={{ fontSize: 11, letterSpacing: "0.2em" }}>{two(i + 1)}</span>
            <div aria-hidden className="bg-dorado" style={{ width: 40, height: 2, marginTop: 14 }} />
            <p className="font-playfair text-bordo" style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 600, lineHeight: 1.12, marginTop: 18 }}>{sub.titulo}</p>
            {sub.desc && <RichText html={sub.desc} className="rich-inline font-sans text-gris-bordo" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 16 }} />}
          </motion.div>
        </Fragment>
      ))}
    </div>
  )
}

/* ── Bloque 4 — cierre: descripción completa ────────────────────────────── */
function ClosingBlock({ html, reduced }: { html: string; reduced: boolean }) {
  return (
    <div style={{ padding: "80px 24px" }}>
      <motion.div
        {...(reduced
          ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: mvp, transition: { duration: 0.5 } }
          : { initial: { opacity: 0, y: 16, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: mvp, transition: { duration: 0.7, ease: EASE } })}
        className="font-sans text-gris-bordo"
        style={{ fontSize: 17, lineHeight: 1.7 }}
      >
        <RichText html={html} className="rich-inline" />
      </motion.div>
    </div>
  )
}
