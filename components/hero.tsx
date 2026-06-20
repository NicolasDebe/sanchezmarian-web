"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { MapPin, ArrowRight } from "lucide-react"
import { fallbacksFor } from "@/lib/home-schema"
import { springSnappy } from "@/lib/animations"
import { RichText } from "@/components/ui/RichText"
import heroMarian from "@/public/images/hero-marian.jpg"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
}

export function Hero({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("hero"), ...content }
  const shouldReduceMotion = useReducedMotion()

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  }

  return (
    <section className="relative w-full overflow-hidden">

      {/* CAPA 1: IMAGEN — define la altura del hero.
          next/Image con import estático: width/height intrínsecos (reserva
          espacio → sin CLS), srcset responsivo (payload menor en mobile) y
          blur placeholder. El style replica el comportamiento cover/min/max. */}
      <Image
        src={heroMarian}
        alt="Marian Sánchez — Comunicación estratégica en Mendoza"
        priority
        quality={90}
        placeholder="blur"
        sizes="100vw"
        className="w-full block"
        style={{
          height: "auto",
          maxHeight: "95vh",
          minHeight: "480px",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />

      {/* CAPA 2: OVERLAY DESKTOP — horizontal */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.05) 60%, transparent 75%)",
        }}
      />

      {/* CAPA 2: OVERLAY MOBILE — vertical */}
      <div
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* CAPA 3: TEXTO */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-10 md:pb-0">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg"
          >

            {/* PILL GEOLOCALIZACIÓN — solo en el hero del home */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
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
                  fontSize: "11px",
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
                fontSize: "11px",
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
                margin: "0 0 24px",
                fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
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
                fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                color: "rgba(254,252,239,0.8)",
                lineHeight: 1.75,
                maxWidth: "420px",
                marginBottom: "32px",
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
                  fontSize: "14px",
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
                  fontSize: "14px",
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
