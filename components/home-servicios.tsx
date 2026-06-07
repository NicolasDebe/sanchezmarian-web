"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { fadeUp, revealCard, fadeUpStagger, viewportOnce } from "@/lib/animations"

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

        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo mb-4"
            style={{ fontSize: 11, letterSpacing: "0.15em" }}
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo leading-[1.1] mb-5"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            Conexión genuina para potenciar la voz y el mensaje de tu negocio.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            Tres servicios alineados que se adaptan a cada etapa de tu negocio.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {CARDS.map((card) => (
            <motion.div key={card.num} variants={revealCard}>
              <Link
                href={card.href}
                className="group flex flex-col gap-4 bg-hueso border border-dorado/30 rounded-xl p-8 hover:-translate-y-1 hover:border-bordo/40 transition-all duration-300 h-full"
              >
                <p className="font-mono text-bordo" style={{ fontSize: 12 }}>
                  {card.num}
                </p>

                <p
                  className="font-playfair font-bold text-negro-bordo leading-snug"
                  style={{ fontSize: 22 }}
                >
                  {card.nombre}
                </p>

                <p
                  className="font-playfair italic text-bordo"
                  style={{ fontSize: 14 }}
                >
                  {card.tagline}
                </p>

                <p
                  className="font-sans text-bordo mt-auto"
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
