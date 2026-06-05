"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"

const SERVICIOS_DATA = [
  {
    num: "01",
    nombre: "Prensa y Comunicación Multiplataforma",
    tagline: "Historias con impacto real.",
    descripcion:
      "Analizo el valor de tu negocio y genero contenido multiplataforma de una forma simple, garantizando credibilidad y autoridad.",
    subServicios: [
      "Gestión de Medios (Earned Media): Redacción y distribución estratégica de gacetillas de prensa orientadas a objetivos, no a formatos rígidos.",
      "Laboratorio de comunicación: Entrenamiento técnico y discursivo para voceros ante escenarios mediáticos reales.",
      "Monitoreo: Seguimiento del impacto de tu negocio en los medios de comunicación.",
    ],
  },
  {
    num: "02",
    nombre: "Consultoría y Diseño de Comunicación Estratégica",
    tagline: "Mentoría en comunicación estratégica.",
    descripcion:
      "Trabajo codo a codo con vos para entender qué querés decir y cómo decirlo. Estructuramos los mensajes clave de tu negocio y diseñamos un plan de visibilidad realista y accionable.",
    subServicios: [
      "Auditoría y Planificación 360°: Diagnóstico profundo de la identidad del negocio y alineación de la comunicación interna con la externa.",
      "Estrategia en todos los canales: Co-creamos mensajes que funcionan igual en Instagram que en una nota de prensa.",
      "Alianzas: Trabajo con profesionales de marketing y redes sociales para que tengas todo lo que necesitás en un solo equipo.",
    ],
  },
  {
    num: "03",
    nombre: "Relaciones Públicas y Eventos Institucionales",
    tagline: "Eventos y relaciones que abren puertas.",
    descripcion:
      "Organizo y coordino eventos y lanzamientos donde las personas se conectan de verdad. Acercá tu marca a periodistas, autoridades y referentes del sector en espacios que generan conversaciones que valen.",
    subServicios: [
      "RRPP y Networking Estratégico: Conexión directa y gestión de invitaciones para eventos de alto impacto.",
      "Lanzamientos: Coordinación integral de la convocatoria de prensa y cobertura mediática para eventos.",
    ],
  },
]

export function Servicios() {
  return (
    <section id="servicios" className="bg-hueso py-[140px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-[80px]"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4"
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo text-[52px] leading-[1.0] mb-6"
          >
            <span className="block">Tu negocio tiene una historia.</span>
            <em className="block italic text-bordo">Yo te ayudo a contarla bien.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-[14px] text-gris-bordo max-w-[580px] leading-relaxed"
          >
            Trabajo sin intermediarios ni formatos rígidos. Escucho lo que tenés para contar,
            entiendo tu negocio y diseño una estrategia a medida. Me involucro de verdad:
            para mí cada proyecto importa.
          </motion.p>
        </motion.div>

        {/* Grid de servicios */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 lg:grid-cols-3"
        >
          {SERVICIOS_DATA.map((s) => (
            <motion.div
              key={s.num}
              variants={fadeUp}
              className="group pt-8 lg:pr-12 cursor-default"
            >
              <div className="w-full h-px bg-dorado/20 mb-8" />

              <span className="block font-mono text-[10px] text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                {s.num}
              </span>

              <p className="font-playfair font-bold text-negro-bordo text-[22px] leading-[1.1] mb-2 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                {s.nombre}
              </p>

              <p className="font-sans italic text-[13px] text-bordo mb-3">{s.tagline}</p>

              <p className="font-sans text-[13px] text-gris-bordo leading-relaxed mb-4">{s.descripcion}</p>

              <ul className="flex flex-col gap-2">
                {s.subServicios.map((sub, i) => (
                  <li
                    key={i}
                    className="font-sans text-[12px] text-gris-bordo/80 leading-relaxed pl-3 border-l-2 border-dorado/30"
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Link centrado */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/#contacto"
            className="font-sans text-[14px] text-bordo relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-bordo after:transition-all after:duration-300 hover:after:w-full"
          >
            Quiero este servicio →
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
