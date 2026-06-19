"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { fadeUp, revealCard, fadeUpStagger, viewportOnce, springSnappy } from "@/lib/animations"

const CARDS = [
  {
    num: "01",
    nombre: "Prensa y Comunicación Multiplataforma",
    tagline: "Historias con impacto real.",
    href: "/servicios#servicio-01",
  },
  {
    num: "02",
    nombre: "Mentoría y Asesoramiento en Comunicación Estratégica",
    tagline: "La arquitectura narrativa que tu negocio necesita.",
    href: "/servicios#servicio-02",
  },
  {
    num: "03",
    nombre: "Relaciones Públicas",
    tagline: "Conexión genuina para potenciar tu historia y tu red de contactos.",
    href: "/servicios#servicio-03",
  },
]

export function HomeServicios() {
  return (
    <section id="servicios" className="bg-hueso-oscuro py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header — centrado */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo mb-4"
            style={{ fontSize: 11, letterSpacing: "0.15em" }}
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6 mx-auto" />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo leading-[1.1] mb-5 mx-auto"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)", maxWidth: 640 }}
          >
            Conexión genuina para potenciar la voz y el mensaje de tu negocio.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo mx-auto"
            style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 440 }}
          >
            Tres servicios alineados que se adaptan a cada etapa de tu negocio.
          </motion.p>
        </motion.div>

        {/* Cards — stagger 120ms */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.num}
              variants={revealCard}
              whileTap={{ scale: 0.985 }}
              transition={springSnappy}
              className="h-full"
            >
              <Link
                href={card.href}
                className={[
                  "group flex flex-col h-full",
                  "bg-hueso border border-dorado/25 rounded-2xl",
                  "p-6 sm:p-9",
                  "hover:-translate-y-1.5 hover:border-bordo/30",
                  "hover:shadow-[0_12px_40px_rgba(102,0,31,0.06)]",
                  "transition-all duration-300",
                ].join(" ")}
              >
                {/* número */}
                <p
                  className="font-mono text-bordo/50 mb-3"
                  style={{ fontSize: 12 }}
                >
                  {card.num}
                </p>

                {/* línea dorada 24px */}
                <div className="w-6 h-px bg-dorado mb-5" />

                {/* nombre */}
                <p
                  className="font-playfair font-bold text-negro-bordo leading-snug mb-2"
                  style={{ fontSize: 20 }}
                >
                  {card.nombre}
                </p>

                {/* tagline — DM Sans italic (no Playfair: serif a 13px es ilegible) */}
                <p
                  className="font-sans italic text-bordo/80 mb-6"
                  style={{ fontSize: 13, lineHeight: 1.6 }}
                >
                  {card.tagline}
                </p>

                {/* link — empujado al fondo */}
                <p
                  className="font-sans text-bordo mt-auto group-hover:underline"
                  style={{ fontSize: 13 }}
                >
                  Conocer más →
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
