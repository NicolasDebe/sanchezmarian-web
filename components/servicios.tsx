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
      "No se trata de enviar notas masivas, sino de construir puentes honestos y duraderos con los periodistas. Analizo el valor periodístico de tu negocio y lo transformo en contenido relevante para los medios tradicionales y digitales, garantizando credibilidad y autoridad.",
    subServicios: [
      "Gestión de Medios (Earned Media): Redacción y distribución estratégica de gacetillas de prensa orientadas a objetivos, no a formatos rígidos.",
      "Laboratorio de comunicación: Entrenamiento técnico y discursivo para voceros ante escenarios mediáticos reales.",
      "Monitoreo: Medición cualitativa del impacto de tu negocio en el ecosistema de medios de comunicación.",
    ],
  },
  {
    num: "02",
    nombre: "Consultoría y Diseño de Comunicación Estratégica",
    tagline: "La arquitectura narrativa que tu negocio necesita para crecer.",
    descripcion:
      "Un espacio de asesoramiento horizontal, fluido y sin intermediarios rígidos. Trabajo a la par de los profesionales para descubrir su brillo auténtico, estructurar sus mensajes clave y diseñar un plan de visibilidad a la medida de su inteligencia específica.",
    subServicios: [
      "Auditoría y Planificación 360°: Diagnóstico profundo de la identidad del negocio y alineación de la comunicación interna con la externa.",
      "Estrategia Multiplataforma: Co-creación de narrativas que fluyen con coherencia nativa desde los canales institucionales hasta los entornos digitales.",
      "Gestión de Alianzas Estratégicas: Tejiendo redes con profesionales especializados en marketing y redes sociales para ofrecerte soluciones integrales y sinérgicas.",
    ],
  },
  {
    num: "03",
    nombre: "Relaciones Públicas y Eventos Institucionales",
    tagline: "Conexión genuina para potenciar tu historia y tu red de contactos.",
    descripcion:
      "Diseño y coordino acciones presenciales donde el diálogo y la apertura son los protagonistas. Conecto a profesionales con sus públicos de interés (stakeholders), autoridades y líderes de opinión, creando entornos de confianza mutua.",
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
            <span className="block">Conexión genuina para potenciar</span>
            <em className="block italic text-bordo">la voz y el mensaje de tu negocio.</em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-[14px] text-gris-bordo max-w-[580px] leading-relaxed"
          >
            Diseño relaciones profesionales sin intermediarios ni estructuras rígidas: vínculos
            fluidos y horizontales donde el diálogo y la apertura son la base de todo. Mi rol
            combina el asesoramiento estratégico con una gestión activa y resolutiva, creando
            una conexión genuina con cada persona para que se sienta verdaderamente escuchada,
            contenida y potenciada en cada etapa de la estrategia de comunicación de su negocio.
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
            href="/contacto"
            className="font-sans text-[14px] text-bordo relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-bordo after:transition-all after:duration-300 hover:after:w-full"
          >
            Quiero este servicio →
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
