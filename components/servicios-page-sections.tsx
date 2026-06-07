"use client"

import { Fragment } from "react"
import { motion } from "motion/react"
import type { Variants } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"

/* ─── helpers ───────────────────────────────────────────────────── */
function splitSub(s: string): { titulo: string; desc: string } {
  const i = s.indexOf(": ")
  if (i === -1) return { titulo: s, desc: "" }
  return { titulo: s.slice(0, i), desc: s.slice(i + 2) }
}

const subStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

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
          className="flex flex-col gap-5"
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
            className="font-playfair font-bold text-negro-bordo"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.15 }}
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
    <section id={s.id} className={`${s.bg} py-[120px] overflow-hidden`}>
      <div className="max-w-[900px] mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative flex flex-col"
        >
          {/* número marca de agua — solo desktop */}
          <span
            className="hidden md:block absolute font-playfair italic text-bordo select-none pointer-events-none leading-none"
            style={{ fontSize: 120, opacity: 0.1, top: -20, right: 0 }}
            aria-hidden
          >
            {s.num}
          </span>

          {/* nombre */}
          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo relative z-10 mb-3"
            style={{ fontSize: 36, lineHeight: 1.1 }}
          >
            {s.nombre}
          </motion.h2>

          {/* tagline */}
          <motion.p
            variants={fadeUp}
            className="font-playfair italic text-bordo relative z-10 mb-6"
            style={{ fontSize: 18 }}
          >
            {s.tagline}
          </motion.p>

          {/* descripción */}
          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo relative z-10 mb-12"
            style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 680 }}
          >
            {s.descripcion}
          </motion.p>

          {/* label */}
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo relative z-10 mb-5"
            style={{ fontSize: 11, letterSpacing: "0.15em", opacity: 0.6 }}
          >
            Sub-servicios:
          </motion.p>

          {/* lista sub-servicios con stagger propio */}
          <motion.ul
            variants={subStagger}
            className="flex flex-col relative z-10"
            style={{ gap: 20 }}
          >
            {s.subServicios.map((sub, i) => {
              const { titulo, desc } = splitSub(sub)
              return (
                <motion.li key={i} variants={fadeUp} className="flex items-start gap-4">
                  {/* indicador vertical dorado */}
                  <span
                    className="shrink-0 bg-bordo rounded-full"
                    style={{ width: 2, height: 20, marginTop: 4 }}
                  />
                  <div>
                    <p
                      className="font-sans font-semibold text-negro-bordo"
                      style={{ fontSize: 15, lineHeight: 1.5 }}
                    >
                      {titulo}
                    </p>
                    {desc && (
                      <p
                        className="font-sans text-gris-bordo mt-1"
                        style={{ fontSize: 14, lineHeight: 1.7 }}
                      >
                        {desc}
                      </p>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* botón */}
          <motion.div variants={fadeUp} className="relative z-10 mt-10">
            <Link
              href="/#contacto"
              className="inline-flex items-center bg-bordo text-hueso font-sans font-semibold rounded-lg hover:bg-bordo-oscuro active:scale-[0.98] transition-all duration-200"
              style={{ fontSize: 14, paddingInline: 28, paddingBlock: 14 }}
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
      {/* banda separadora 4px --bordo */}
      <div className="w-full bg-bordo" style={{ height: 4 }} aria-hidden />
      {SERVICIOS.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && (
            <div className="w-full bg-bordo/15" style={{ height: 1 }} aria-hidden />
          )}
          <ServicioSection s={s} />
        </Fragment>
      ))}
    </>
  )
}
