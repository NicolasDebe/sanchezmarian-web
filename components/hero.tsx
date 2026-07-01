"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { MapPin, ArrowRight } from "lucide-react"
import { fallbacksFor } from "@/lib/home-schema"
import { springSnappy } from "@/lib/animations"
import { RichText } from "@/components/ui/RichText"
import heroMarian from "@/public/images/hero-marian.jpg"

/* Curva expo-out para el momento propio del H1 mobile. */
const EASE = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
}

/* itemVariants depende de reduced; se genera una vez y se comparte a ambas
   variantes responsive para no duplicar la definición de animaciones. */
const makeItemVariants = (reduced: boolean) => ({
  hidden: { opacity: 0, y: reduced ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
})

export function Hero({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("hero"), ...content }
  const reduced = !!useReducedMotion()

  return (
    <>
      <HeroMobile c={c} reduced={reduced} />
      <HeroDesktop c={c} reduced={reduced} />
    </>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   MOBILE (md:hidden) — layout dedicado: imagen COMPLETA (aspect 3:2, sin
   crop) con el H1 superpuesto sobre la zona blanca de las cortinas; debajo,
   en flujo normal sobre fondo hueso, la pill + eyebrow + subtitle + CTAs.
   ════════════════════════════════════════════════════════════════════════ */
function HeroMobile({ c, reduced }: { c: Record<string, string>; reduced: boolean }) {
  const itemVariants = makeItemVariants(reduced)

  return (
    <section className="md:hidden bg-hueso">

      {/* BLOQUE 1 — IMAGEN CON H1 SUPERPUESTO */}
      <div className="relative w-full">
        <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
          <Image
            src={heroMarian}
            alt="Marian Sánchez — Comunicación estratégica en Mendoza"
            fill
            preload
            quality={90}
            placeholder="blur"
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
          {/* Realce sutil hueso→transparent sobre el 60% izquierdo: refuerza el
              contraste del H1 sin oscurecer la foto (la zona ya es clara). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(254,252,239,0.35) 0%, rgba(254,252,239,0.12) 35%, transparent 60%)",
            }}
          />
        </div>

        {/* H1 ABSOLUTO sobre la zona blanca de las cortinas (izquierda) */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="absolute font-playfair font-bold text-negro-bordo"
          style={{
            top: "50%",
            left: "24px",
            transform: "translateY(-50%)",
            maxWidth: "55%",
            fontSize: "clamp(2rem, 8.5vw, 2.8rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: "0 1px 2px rgba(254, 252, 239, 0.6)",
          }}
        >
          {c.h1}
        </motion.h1>
      </div>

      {/* BLOQUE 2 — TEXTO DEBAJO DE LA IMAGEN */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col"
        style={{
          paddingInline: "24px",
          paddingTop: "32px",
          paddingBottom: "48px",
          gap: "20px",
        }}
      >
        {/* Pill ubicación */}
        <motion.div variants={itemVariants}>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-bordo/20 bg-bordo/5 font-mono uppercase text-bordo"
            style={{
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "0.14em",
              padding: "8px 14px",
            }}
          >
            <MapPin size={12} aria-hidden />
            {c.location_tag}
          </span>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          variants={itemVariants}
          className="font-mono uppercase text-gris-bordo"
          style={{
            fontSize: "var(--fs-eyebrow)",
            letterSpacing: "0.16em",
            margin: 0,
          }}
        >
          {c.eyebrow}
        </motion.p>

        {/* Subtitle (RichText con los 4 párrafos) — color gris-bordo sobre hueso */}
        <motion.div
          variants={itemVariants}
          className="rich-inline hero-subtitle"
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "var(--fs-body)",
            lineHeight: 1.7,
            color: "var(--color-gris-bordo)",
          }}
        >
          <RichText html={c.subtitle} className="rich-inline" />
        </motion.div>

        {/* CTAs — primario pill bordó + secundario outline */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3"
          style={{ marginTop: "12px" }}
        >
          <motion.a
            href={c.cta_primary_link}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-bordo font-sans font-semibold text-hueso"
            style={{
              padding: "14px 28px",
              fontSize: "var(--fs-body)",
              letterSpacing: "0.02em",
            }}
          >
            {c.cta_primary_label}
            <ArrowRight size={16} aria-hidden />
          </motion.a>

          <motion.a
            href={c.cta_secondary_link}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-bordo bg-transparent font-sans font-semibold text-bordo"
            style={{
              padding: "14px 28px",
              fontSize: "var(--fs-body)",
              letterSpacing: "0.02em",
            }}
          >
            {c.cta_secondary_label}
            <ArrowRight size={16} aria-hidden />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   DESKTOP (hidden md:block) — layout existente aprobado, sin cambios: foto
   full-bleed con overlay y texto a la izquierda centrado vertical.
   ════════════════════════════════════════════════════════════════════════ */
function HeroDesktop({ c, reduced }: { c: Record<string, string>; reduced: boolean }) {
  const itemVariants = makeItemVariants(reduced)

  return (
    <section className="relative w-full overflow-hidden hidden md:block">

      {/* CAPA 1: IMAGEN — define la altura del hero.
          next/Image con import estático: width/height intrínsecos (reserva
          espacio → sin CLS), srcset responsivo (payload menor en mobile) y
          blur placeholder. En desktop la altura es h-auto (la imagen 1200×800
          a pleno ancho da ~850–960px), con un piso clamp(640px,80vh,720px) y
          SIN techo de vh: así el hero crece con su contenido y no recorta el
          texto largo a 100% de zoom (un max-h-screen anclaba el alto al
          viewport y bajo zoom-in dejaba el texto afuera). */}
      <Image
        src={heroMarian}
        alt="Marian Sánchez — Comunicación estratégica en Mendoza"
        preload
        quality={90}
        placeholder="blur"
        sizes="100vw"
        className="block w-full object-cover object-top absolute inset-0 h-full md:static md:h-auto md:min-h-[clamp(640px,80vh,720px)]"
      />

      {/* CAPA 2: OVERLAY DESKTOP — horizontal */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 55%, transparent 75%)",
        }}
      />

      {/* CAPA 3: TEXTO — absolute inset-0 centrado vertical, alineado izquierda. */}
      <div className="absolute inset-0 flex items-center py-20">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >

            {/* PILL GEOLOCALIZACIÓN — solo en el hero del home */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
              style={{
                background: "rgba(254,252,239,0.10)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                border: "1px solid rgba(254,252,239,0.20)",
              }}
            >
              <MapPin size={14} strokeWidth={1.5} style={{ color: "#FEFCEF" }} />
              <span
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "var(--fs-eyebrow)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#FEFCEF",
                }}
              >
                {c.location_tag}
              </span>
            </motion.div>

            {/* EYEBROW */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "var(--fs-eyebrow)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(254,252,239,0.65)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {c.eyebrow}
            </motion.p>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-playfair-display), serif",
                lineHeight: 1.05,
                color: "#FEFCEF",
                fontWeight: 700,
                margin: "0 0 20px",
                fontSize: "calc(clamp(2rem, 5vw, 4rem) * var(--text-scale))",
                letterSpacing: "-0.02em",
              }}
            >
              {c.h1}
            </motion.h1>

            {/* DESCRIPCIÓN */}
            <motion.div
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "calc(clamp(0.85rem, 1.35vw, 0.98rem) * var(--text-scale))",
                color: "rgba(254,252,239,0.8)",
                lineHeight: 1.7,
                maxWidth: "520px",
                marginBottom: "28px",
              }}
            >
              <RichText html={c.subtitle} className="rich-inline" />
            </motion.div>

            {/* BOTONES — primario (fill --hueso) + secundario (outline).
                Misma altura y curva; la diferencia es solo fill vs outline. */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.a
                href={c.cta_primary_link}
                className="group justify-center text-center"
                whileHover={{ scale: 1.02, backgroundColor: "#F0E8D8" }}
                whileTap={{ scale: 0.98 }}
                transition={springSnappy}
                style={{
                  backgroundColor: "#FEFCEF",
                  color: "#66001F",
                  padding: "16px 28px",
                  borderRadius: "999px",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: "calc(14px * var(--text-scale))",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  letterSpacing: "0.01em",
                  lineHeight: 1.35,
                }}
              >
                {c.cta_primary_label}
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </motion.a>

              <motion.a
                href={c.cta_secondary_link}
                className="justify-center text-center"
                whileHover={{
                  backgroundColor: "rgba(254,252,239,0.08)",
                  borderColor: "rgba(254,252,239,1)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={springSnappy}
                style={{
                  backgroundColor: "transparent",
                  color: "#FEFCEF",
                  padding: "16px 28px",
                  borderRadius: "999px",
                  border: "1px solid rgba(254,252,239,0.4)",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: "calc(14px * var(--text-scale))",
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {c.cta_secondary_label}
              </motion.a>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </section>
  )
}
