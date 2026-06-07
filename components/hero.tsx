"use client"

import { motion, useReducedMotion } from "motion/react"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.2,
    },
  },
}

export function Hero() {
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

      {/* CAPA 1: IMAGEN — define la altura del hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-marian.jpg"
        alt="Marian Sánchez — Comunicación estratégica en Mendoza"
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
              Comunicación estratégica y narrativas multiplataforma para negocios
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
              Comunicar es conectar
            </motion.h1>

            {/* DESCRIPCIÓN */}
            <motion.p
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
              Diseño estrategias de comunicación multiplataforma con visión de
              futuro que transforman tu valor diferencial en visibilidad real.
              Te acompaño a construir puentes honestos con los medios y la
              comunidad para que el mensaje de tu negocio resuene con fuerza,
              claridad y el impacto que realmente merece.
            </motion.p>

            {/* BOTONES */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/#contacto"
                style={{
                  backgroundColor: "#FEFCEF",
                  color: "#66001F",
                  padding: "13px 28px",
                  borderRadius: "100px",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  letterSpacing: "0.01em",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)"
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(254,252,239,0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                Tengo un negocio con una historia para contar
                <span aria-hidden="true">→</span>
              </a>

              <a
                href="/mis-valores"
                style={{
                  backgroundColor: "rgba(254,252,239,0.06)",
                  color: "#FEFCEF",
                  padding: "13px 28px",
                  borderRadius: "100px",
                  border: "1.5px solid rgba(254,252,239,0.35)",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  letterSpacing: "0.01em",
                  transition: "background-color 0.15s ease, border-color 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(254,252,239,0.12)"
                  e.currentTarget.style.borderColor = "rgba(254,252,239,0.6)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(254,252,239,0.06)"
                  e.currentTarget.style.borderColor = "rgba(254,252,239,0.35)"
                }}
              >
                Mis valores
              </a>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </section>
  )
}
