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
      staggerChildren: 0.12,
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
    <section
      className="w-full"
      style={{ backgroundColor: "var(--color-hueso)" }}
    >
      <div
        className="mx-auto flex flex-col gap-10 px-6 pt-12 pb-[72px] md:grid md:grid-cols-12 md:items-center md:gap-16 md:px-12 md:pt-24 md:pb-[120px]"
        style={{ maxWidth: "1280px" }}
      >
        {/* COLUMNA FOTO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative md:col-span-5"
        >
          {/* Línea decorativa editorial (solo desktop) a la izquierda de la foto. */}
          <span
            aria-hidden="true"
            className="absolute hidden md:block"
            style={{
              left: "-20px",
              top: "10%",
              height: "80%",
              width: "1px",
              backgroundColor: "var(--color-dorado)",
              opacity: 0.4,
            }}
          />
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "4 / 5", borderRadius: "2px" }}
          >
            <Image
              src={heroMarian}
              alt="Marian Sánchez — Comunicación estratégica en Mendoza"
              fill
              quality={90}
              placeholder="blur"
              sizes="(min-width: 768px) 40vw, 100vw"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        </motion.div>

        {/* COLUMNA TEXTO */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-7"
        >
          {/* PILL GEOLOCALIZACIÓN */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              marginBottom: "28px",
              background: "rgba(102,0,31,0.06)",
              border: "1px solid rgba(102,0,31,0.15)",
            }}
          >
            <MapPin size={14} strokeWidth={1.5} style={{ color: "var(--color-bordo)" }} />
            <span
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-bordo)",
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
              color: "var(--color-gris-bordo)",
              marginBottom: "16px",
            }}
          >
            {c.eyebrow}
          </motion.p>

          {/* H1 */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: "var(--font-playfair-display), serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "var(--color-negro-bordo)",
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              margin: "0 0 32px",
            }}
          >
            {c.h1}
          </motion.h1>

          {/* SUBTITLE — texto editorial largo */}
          <motion.div
            variants={itemVariants}
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--color-gris-bordo)",
              maxWidth: "560px",
              marginBottom: "40px",
            }}
          >
            <RichText html={c.subtitle} className="rich-inline hero-subtitle" />
          </motion.div>

          {/* BOTONES */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <motion.a
              href={c.cta_primary_link}
              className="group justify-center text-center"
              whileHover={{ scale: 1.02, backgroundColor: "var(--color-bordo-oscuro)" }}
              whileTap={{ scale: 0.98 }}
              transition={springSnappy}
              style={{
                backgroundColor: "var(--color-bordo)",
                color: "var(--color-hueso)",
                padding: "16px 28px",
                borderRadius: "999px",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
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
                backgroundColor: "rgba(102,0,31,0.05)",
                borderColor: "var(--color-bordo)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={springSnappy}
              style={{
                backgroundColor: "transparent",
                color: "var(--color-bordo)",
                padding: "16px 28px",
                borderRadius: "999px",
                border: "1px solid rgba(102,0,31,0.4)",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              {c.cta_secondary_label}
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
