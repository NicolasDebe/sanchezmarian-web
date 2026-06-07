"use client"

import { motion } from "motion/react"
import Link from "next/link"
import {
  fadeUp,
  revealCard,
  fadeUpStagger,
  viewportOnce,
} from "@/lib/animations"

/* ─── data ─────────────────────────────────────────────────────── */
const SERVICIOS = [
  {
    id: "servicio-01",
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
    bg: "bg-hueso",
  },
  {
    id: "servicio-02",
    num: "02",
    nombre: "Mentoría y Asesoramiento en Comunicación Estratégica",
    tagline: "La arquitectura narrativa que tu negocio necesita.",
    descripcion:
      "Un espacio de asesoramiento y mentoreo fluido desde mi expertise en comunicación. Trabajo a la par de los profesionales para descubrir su brillo auténtico, estructurar sus mensajes clave y diseñar un plan de visibilidad personalizado.",
    subServicios: [
      "Auditoría y Planificación 360°: Diagnóstico profundo de la identidad del negocio y alineación de la comunicación interna con la externa.",
      "Estrategia Multiplataforma: Co-creación de narrativas que fluyen con sinergia y coherencia en diversos canales de comunicación.",
      "Gestión de Alianzas Estratégicas: Formo equipo con profesionales especializados en marketing y redes sociales para ofrecerte soluciones integrales.",
    ],
    bg: "bg-hueso-oscuro",
  },
  {
    id: "servicio-03",
    num: "03",
    nombre: "Relaciones Públicas",
    tagline: "Conexión genuina para potenciar tu historia y tu red de contactos.",
    descripcion:
      "Diseño y coordino acciones presenciales donde el diálogo y la apertura son los protagonistas. Conecto a profesionales con sus públicos de interés (stakeholders), autoridades y líderes de opinión, creando entornos de confianza mutua.",
    subServicios: [
      "RRPP y Networking Estratégico: Planificación de eventos de alto impacto. Conexión directa y gestión de invitaciones para actividades relacionadas al nicho de tu negocio.",
      "Lanzamientos: Coordinación integral de la convocatoria de prensa y cobertura mediática para eventos.",
    ],
    bg: "bg-hueso",
  },
]

/* ─── hero ──────────────────────────────────────────────────────── */
function HeroServicios() {
  return (
    <section className="bg-hueso" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
          style={{ maxWidth: 720 }}
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo"
            style={{ fontSize: 11, letterSpacing: "0.15em" }}
          >
            Servicios
          </motion.p>

          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado" />

          <motion.h1
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo leading-[1.1]"
            style={{ fontSize: "clamp(34px, 4vw, 52px)" }}
          >
            Conexión genuina para potenciar la voz y el mensaje de tu negocio.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            Planifico y gestiono relaciones profesionales sin intermediarios ni
            estructuras rígidas: vínculos fluidos y horizontales donde el diálogo y
            la apertura son la base de todo. Mi rol combina el asesoramiento
            estratégico con una gestión activa y resolutiva, creando una conexión
            genuina con cada persona o empresa para que se sienta verdaderamente
            escuchada, contenida y potenciada en cada etapa de la estrategia de
            comunicación de su negocio.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── servicio individual ───────────────────────────────────────── */
function ServicioSection({ s }: { s: (typeof SERVICIOS)[0] }) {
  return (
    <section id={s.id} className={`${s.bg} py-[100px]`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative flex flex-col gap-6"
          style={{ maxWidth: 760 }}
        >
          {/* número marca de agua */}
          <span
            className="absolute font-playfair italic text-bordo select-none pointer-events-none leading-none"
            style={{ fontSize: 120, opacity: 0.3, top: -16, left: 0 }}
            aria-hidden
          >
            {s.num}
          </span>

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo relative z-10"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1 }}
          >
            {s.nombre}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-playfair italic text-bordo relative z-10"
            style={{ fontSize: 20 }}
          >
            {s.tagline}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo relative z-10"
            style={{ fontSize: 16, lineHeight: 1.7 }}
          >
            {s.descripcion}
          </motion.p>

          <motion.div variants={fadeUp} className="relative z-10">
            <p
              className="font-mono uppercase text-bordo mb-4"
              style={{ fontSize: 11, letterSpacing: "0.15em", opacity: 0.6 }}
            >
              Qué incluye:
            </p>
            <ul className="flex flex-col gap-3">
              {s.subServicios.map((sub, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 rounded-full bg-dorado"
                    style={{ width: 5, height: 5, marginTop: 9 }}
                  />
                  <span
                    className="font-sans text-gris-bordo"
                    style={{ fontSize: 15, lineHeight: 1.7 }}
                  >
                    {sub}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={revealCard} className="relative z-10">
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 border border-bordo text-bordo font-sans font-medium rounded-lg hover:bg-bordo hover:text-hueso transition-all duration-200"
              style={{ fontSize: 14, paddingInline: 24, paddingBlock: 12 }}
            >
              Quiero este servicio
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── export ────────────────────────────────────────────────────── */
export function ServiciosPageSections() {
  return (
    <>
      <HeroServicios />
      {SERVICIOS.map((s) => (
        <ServicioSection key={s.id} s={s} />
      ))}
    </>
  )
}
