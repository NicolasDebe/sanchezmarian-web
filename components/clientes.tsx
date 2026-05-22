"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

const LOGOS = [
  { src: "/images/logos/logo-chakaymanta.png",      alt: "Esc. Vendimia Chakaymanta" },
  { src: "/images/logos/logo-mendoza-regenera.png",  alt: "Cluster Mendoza Regenera" },
  { src: "/images/logos/logo-quienvino.png",         alt: "QuienVino App" },
  { src: "/images/logos/logo-mfmc.png",              alt: "María Florencia Mouradian" },
  { src: "/images/logos/logo-colegio-notarial.png",  alt: "Colegio Notarial de Mendoza" },
  { src: "/images/logos/logo-capilla-acutis.png",    alt: "Capilla Carlo Acutis" },
  { src: "/images/logos/logo-bolsa-comercio.jpg",    alt: "Bolsa de Comercio de Mendoza" },
  { src: "/images/logos/logo-fuerza-silenciosa.jpg", alt: "Fuerza Silenciosa" },
  { src: "/images/logos/logo-agrocosecha.png",       alt: "Agrocosecha" },
  { src: "/images/logos/logo-presidente.png",        alt: "Grupo Presidente" },
  { src: "/images/logos/logo-meneo.png",             alt: "Dra. María Elina Meneo" },
]

function Track() {
  return (
    <div className="flex items-center shrink-0" aria-hidden>
      {LOGOS.map((logo) => (
        <div
          key={logo.src}
          className="flex items-center"
          style={{ paddingLeft: 40, paddingRight: 40 }}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            height={0}
            width={0}
            sizes="160px"
            style={{
              height: undefined,
              width: "auto",
              background: "transparent",
            }}
            className="
              h-[55px] lg:h-[80px] w-auto
              grayscale opacity-60
              hover:grayscale-0 hover:opacity-100 hover:scale-105
              transition-all duration-[400ms] ease-in-out
            "
          />
        </div>
      ))}
    </div>
  )
}

export function Clientes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      className="bg-white overflow-hidden"
      style={{
        paddingTop: "clamp(60px, 6vw, 80px)",
        paddingBottom: "clamp(60px, 6vw, 80px)",
        borderTop: "1px solid rgba(201, 168, 130, 0.3)",
        borderBottom: "1px solid rgba(201, 168, 130, 0.3)",
      }}
    >
      {/* Header centrado */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: EASE }}
        className="text-center px-6 mb-12"
      >
        <p
          className="font-mono uppercase mb-3"
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "var(--color-bordo, #66001F)",
          }}
        >
          Clientes
        </p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
          className="mx-auto mb-5"
          style={{
            width: 40,
            height: 1,
            background: "var(--color-dorado, #C9A882)",
            transformOrigin: "center",
          }}
        />

        <h2
          className="font-playfair font-bold leading-[1.15] mb-3"
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            color: "var(--color-negro-bordo)",
          }}
        >
          Marcas que{" "}
          <em style={{ fontStyle: "italic", color: "var(--color-bordo, #66001F)" }}>
            confían en mi
          </em>
        </h2>

        <p
          className="font-sans"
          style={{
            fontSize: 14,
            color: "var(--color-gris-bordo)",
          }}
        >
          100+ apariciones en medios nacionales y provinciales.
        </p>
      </motion.div>

      {/* Marquee infinito */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
        aria-label="Clientes de Marian Sánchez"
      >
        {/* Fade izquierda */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
        />
        {/* Fade derecha */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
        />

        <div
          className="flex py-4"
          style={{
            animation: "marquee-scroll 35s linear infinite",
            willChange: "transform",
          }}
        >
          <Track />
          <Track />
        </div>
      </motion.div>
    </section>
  )
}
