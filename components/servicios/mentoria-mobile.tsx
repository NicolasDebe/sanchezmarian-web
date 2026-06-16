"use client"

import Image from "next/image"
import { motion, type Variants } from "motion/react"
import { RichText } from "@/components/ui/RichText"
import { cn } from "@/lib/utils"
import { EASE, FEATURED_PHOTO, two, type Servicio } from "./types"

const mvp = { once: true, margin: "-50px" } as const

/* ════════════════════════════════════════════════════════════════════════
   MOBILE — traducción a bloques verticales apilados (no scrollytelling)
   ════════════════════════════════════════════════════════════════════════ */
export function MentoriaMobile({ s, reduced, sectionId }: { s: Servicio; reduced: boolean; sectionId: string }) {
  return (
    <section id={sectionId} className="bg-hueso" aria-label={s.nombre}>
      {/* Bloque 1 — APERTURA */}
      <OpeningBlock title={s.nombre} reduced={reduced} />

      {/* Bloque 2 — FOTO REVELACIÓN */}
      <PhotoBlock alt={s.nombre} reduced={reduced} />

      {/* Bloque 3 — FRASE ANCLA (solo si hay contenido) */}
      {s.anchorPhrase && <AnchorBlock phrase={s.anchorPhrase} reduced={reduced} />}

      {/* Bloque 4 — TÍTULO COMPACTO + TRANSICIÓN */}
      <div style={{ padding: "60px 24px 8px" }}>
        <motion.p
          {...(reduced ? {} : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: mvp, transition: { duration: 0.6, ease: EASE } })}
          className="text-center font-playfair font-medium uppercase text-bordo"
          style={{ fontSize: "clamp(20px, 4vw, 32px)", letterSpacing: "0.02em", lineHeight: 1.2 }}
        >
          {s.nombre}
        </motion.p>
      </div>

      {/* Bloques 5·6·7 — SUB-SERVICIOS APILADOS */}
      {s.subServicios.length > 0 && (
        <div style={{ padding: "32px 24px 8px" }}>
          <div className="flex flex-col" style={{ gap: 24 }}>
            {s.subServicios.map((sub, i) => (
              <motion.div
                key={i}
                {...(reduced ? {} : { variants: cardIn, initial: "hidden" as const, whileInView: "visible" as const, viewport: mvp })}
                className="rounded-2xl bg-hueso-oscuro"
                style={{ padding: 32, border: "1px solid rgba(201,168,130,0.4)" }}
              >
                <span className="font-mono uppercase text-bordo" style={{ fontSize: 10, letterSpacing: "0.2em" }}>{two(i + 1)} — Sub-servicio</span>
                <div className="mt-3 mb-4 h-px bg-dorado" style={{ width: 40 }} />
                <p className="font-playfair font-bold text-bordo" style={{ fontSize: "clamp(24px, 6.5vw, 34px)", lineHeight: 1.12 }}>{sub.titulo}</p>
                {sub.desc && <RichText html={sub.desc} className="rich-inline mt-3 font-sans text-gris-bordo" style={{ fontSize: 15.5, lineHeight: 1.6 }} />}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bloque 8 — DESCRIPCIÓN COMPLETA */}
      {s.descripcion && (
        <div style={{ padding: "64px 24px 80px" }}>
          <motion.div
            {...(reduced ? {} : { initial: { opacity: 0, y: 16, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: mvp, transition: { duration: 0.7, ease: EASE } })}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 17, lineHeight: 1.7 }}
          >
            <RichText html={s.descripcion} className="rich-inline" />
          </motion.div>
        </div>
      )}
    </section>
  )
}

const cardIn: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18 } },
}

/* ── Bloque 1: apertura con título letter-by-letter ─────────────────────── */
const letterContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }
const letter: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
}

function OpeningBlock({ title, reduced }: { title: string; reduced: boolean }) {
  const chars = Array.from(title)
  return (
    <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden" style={{ padding: "100px 24px 48px" }}>
      <span aria-hidden className={cn("pointer-events-none absolute select-none font-playfair text-dorado", !reduced && "ms-asterisk")} style={{ top: 40, right: 24, fontSize: "clamp(36px, 12vw, 60px)", lineHeight: 1, animationDuration: "40s" }}>✳</span>
      <motion.h2 aria-label={title} variants={reduced ? undefined : letterContainer} initial={reduced ? undefined : "hidden"} whileInView={reduced ? undefined : "visible"} viewport={mvp} className="text-center font-playfair text-negro-bordo" style={{ fontSize: "clamp(40px, 11vw, 80px)", lineHeight: 1.0, fontWeight: 900 }}>
        {chars.map((c, i) => (
          <motion.span key={i} variants={reduced ? undefined : letter} aria-hidden className="inline-block" style={{ whiteSpace: "pre" }}>{c}</motion.span>
        ))}
      </motion.h2>
      <div aria-hidden className="absolute text-center" style={{ bottom: 32 }}>
        <div className="font-mono text-bordo" style={{ fontSize: 13, letterSpacing: "0.12em" }}>01</div>
        <div className="mt-1 font-mono uppercase text-gris-bordo" style={{ fontSize: 10, letterSpacing: "0.28em" }}>{(title.split(/\s+/)[0] ?? "").toUpperCase()}</div>
      </div>
    </div>
  )
}

/* ── Bloque 2: foto con clip-path circle al entrar ──────────────────────── */
function PhotoBlock({ alt, reduced }: { alt: string; reduced: boolean }) {
  return (
    <div className="px-6">
      <motion.div
        {...(reduced
          ? {}
          : {
              initial: { clipPath: "circle(0% at 50% 50%)" },
              whileInView: { clipPath: "circle(75% at 50% 50%)" },
              viewport: mvp,
              transition: { duration: 1.1, ease: EASE },
            })}
        className="relative overflow-hidden rounded-2xl"
        style={{ height: "60vh" }}
      >
        <Image src={FEATURED_PHOTO} alt={alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: "center 22%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(102,0,31,0.28), transparent 60%)" }} />
      </motion.div>
    </div>
  )
}

/* ── Bloque 3: frase ancla word-by-word ─────────────────────────────────── */
const wordContainer: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const wordItem: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 10 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.6, ease: EASE } },
}

function AnchorBlock({ phrase, reduced }: { phrase: string; reduced: boolean }) {
  const words = phrase.split(/\s+/).filter(Boolean)
  return (
    <div style={{ padding: "80px 24px" }}>
      <motion.p variants={reduced ? undefined : wordContainer} initial={reduced ? undefined : "hidden"} whileInView={reduced ? undefined : "visible"} viewport={mvp} className="text-center font-playfair italic text-dorado" style={{ fontSize: "clamp(28px, 7vw, 48px)", lineHeight: 1.15 }}>
        {words.map((w, i) => (
          <motion.span key={i} variants={reduced ? undefined : wordItem} className="inline-block" style={{ whiteSpace: "pre" }}>{w}{i < words.length - 1 ? " " : ""}</motion.span>
        ))}
      </motion.p>
    </div>
  )
}
