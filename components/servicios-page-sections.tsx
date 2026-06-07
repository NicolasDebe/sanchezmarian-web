"use client"

import { Fragment } from "react"
import { motion } from "motion/react"
import type { Variants } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"

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

/* ─── esquemas de color ─────────────────────────────────────────── */
type Scheme = {
  watermarkClass: string
  watermarkOpacity: number
  nombreClass: string
  taglineClass: string
  descClass: string
  labelClass: string
  labelOpacity: number
  indicadorClass: string
  subTituloClass: string
  subDescClass: string
  btnClass: string
}

const LIGHT: Scheme = {
  watermarkClass:  "text-bordo",
  watermarkOpacity: 0.1,
  nombreClass:     "text-negro-bordo",
  taglineClass:    "text-bordo",
  descClass:       "text-gris-bordo",
  labelClass:      "text-bordo",
  labelOpacity:    0.6,
  indicadorClass:  "bg-bordo",
  subTituloClass:  "text-negro-bordo",
  subDescClass:    "text-gris-bordo",
  btnClass:        "bg-bordo text-hueso hover:bg-bordo-oscuro",
}

const DARK: Scheme = {
  watermarkClass:  "text-hueso",
  watermarkOpacity: 0.08,
  nombreClass:     "text-hueso",
  taglineClass:    "text-hueso/70",
  descClass:       "text-hueso/85",
  labelClass:      "text-dorado",
  labelOpacity:    1,
  indicadorClass:  "bg-dorado",
  subTituloClass:  "text-hueso",
  subDescClass:    "text-hueso/75",
  btnClass:        "bg-hueso text-bordo hover:bg-arena",
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
    bg:   "bg-hueso",
    dark: false,
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
    bg:   "bg-bordo",
    dark: true,
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
    bg:   "bg-hueso",
    dark: false,
  },
]

/* ─── hero ──────────────────────────────────────────────────────── */
function HeroServicios() {
  return (
    <section
      className="relative bg-hueso overflow-hidden"
      style={{ paddingTop: 140, paddingBottom: 100 }}
    >
      <TextureOverlay texture="paperGrain" opacity={0.2} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
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
  const c = s.dark ? DARK : LIGHT

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
            className={`hidden md:block absolute font-playfair italic ${c.watermarkClass} select-none pointer-events-none leading-none`}
            style={{ fontSize: 120, opacity: c.watermarkOpacity, top: -20, right: 0 }}
            aria-hidden
          >
            {s.num}
          </span>

          {/* nombre */}
          <motion.h2
            variants={fadeUp}
            className={`font-playfair font-bold ${c.nombreClass} relative z-10 mb-3`}
            style={{ fontSize: 36, lineHeight: 1.1 }}
          >
            {s.nombre}
          </motion.h2>

          {/* tagline */}
          <motion.p
            variants={fadeUp}
            className={`font-playfair italic ${c.taglineClass} relative z-10 mb-6`}
            style={{ fontSize: 18 }}
          >
            {s.tagline}
          </motion.p>

          {/* descripción */}
          <motion.p
            variants={fadeUp}
            className={`font-sans ${c.descClass} relative z-10 mb-12`}
            style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 680 }}
          >
            {s.descripcion}
          </motion.p>

          {/* label */}
          <motion.p
            variants={fadeUp}
            className={`font-mono uppercase ${c.labelClass} relative z-10 mb-5`}
            style={{ fontSize: 11, letterSpacing: "0.15em", opacity: c.labelOpacity }}
          >
            Sub-servicios:
          </motion.p>

          {/* lista con stagger propio */}
          <motion.ul
            variants={subStagger}
            className="flex flex-col relative z-10"
            style={{ gap: 20 }}
          >
            {s.subServicios.map((sub, i) => {
              const { titulo, desc } = splitSub(sub)
              return (
                <motion.li key={i} variants={fadeUp} className="flex items-start gap-4">
                  <span
                    className={`shrink-0 rounded-full ${c.indicadorClass}`}
                    style={{ width: 2, height: 20, marginTop: 4 }}
                  />
                  <div>
                    <p
                      className={`font-sans font-semibold ${c.subTituloClass}`}
                      style={{ fontSize: 15, lineHeight: 1.5 }}
                    >
                      {titulo}
                    </p>
                    {desc && (
                      <p
                        className={`font-sans ${c.subDescClass} mt-1`}
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
              className={`inline-flex items-center font-sans font-semibold rounded-lg active:scale-[0.98] transition-all duration-200 ${c.btnClass}`}
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
