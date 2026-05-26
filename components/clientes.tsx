"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { motion, useInView, AnimatePresence } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

const LOGOS = [
  { src: "/images/logos/logo-capilla-acutis.png",    alt: "Capilla Carlo Acutis" },
  { src: "/images/logos/logo-colegio-notarial.png",  alt: "Colegio Notarial de Mendoza" },
  { src: "/images/logos/logo-bolsa-comercio.png",    alt: "Bolsa de Comercio de Mendoza" },
  { src: "/images/logos/logo-presidente.png",        alt: "Grupo Presidente" },
  { src: "/images/logos/logo-quienvino.png",         alt: "QuienVino App" },
  { src: "/images/logos/logo-agrocosecha.png",       alt: "Agrocosecha" },
  { src: "/images/logos/logo-chakaymanta.png",       alt: "Esc. Vendimia Chakaymanta" },
  { src: "/images/logos/logo-mendoza-regenera.png",  alt: "Cluster Mendoza Regenera" },
  { src: "/images/logos/logo-fuerza-silenciosa.jpg", alt: "Fuerza Silenciosa" },
  { src: "/images/logos/logo-meneo.png",             alt: "Dra. María Elina Meneo" },
  { src: "/images/logos/logo-mfmc.png",              alt: "María Florencia Mouradian" },
]

function RotatingCard({ initialIndex, delay }: { initialIndex: number; delay: number }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % LOGOS.length)
      }, 3000)
    }, delay)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [delay])

  const logo = LOGOS[currentIndex]

  return (
    <div
      className="w-[260px] h-[160px] lg:w-[320px] lg:h-[200px]"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        border: "1px solid rgba(102,0,31,0.1)",
        borderRadius: 12,
        padding: "48px 56px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={logo.src}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={220}
            height={130}
            style={{
              maxWidth: 220,
              maxHeight: 130,
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function Clientes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section
      ref={ref}
      className="overflow-hidden"
      style={{
        background: "#FFFFFF",
        paddingTop: "clamp(60px, 6vw, 80px)",
        paddingBottom: "clamp(60px, 6vw, 80px)",
        borderTop: "1px solid rgba(201, 168, 130, 0.3)",
        borderBottom: "1px solid rgba(201, 168, 130, 0.3)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: EASE }}
        className="text-center px-6 mb-12"
      >
        <p
          className="font-mono uppercase mb-3"
          style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--color-bordo, #66001F)" }}
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
          style={{ fontSize: "clamp(28px, 4vw, 36px)", color: "var(--color-negro-bordo)" }}
        >
          Marcas que{" "}
          <em style={{ fontStyle: "italic", color: "var(--color-bordo, #66001F)" }}>
            confían en mi
          </em>
        </h2>
        <p className="font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)" }}>
          100+ apariciones en medios nacionales y provinciales.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
        className="flex items-center justify-center flex-wrap gap-5 px-6"
      >
        <RotatingCard initialIndex={0} delay={0} />
        <RotatingCard initialIndex={4} delay={1000} />
        <RotatingCard initialIndex={8} delay={2000} />
      </motion.div>
    </section>
  )
}
