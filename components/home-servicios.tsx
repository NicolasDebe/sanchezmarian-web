"use client"

import { motion, type Variants } from "motion/react"
import Link from "next/link"
import { fadeUp, fadeUpStagger, viewportOnce, EASE_EXPO } from "@/lib/animations"

/**
 * Sección de servicios del HOME — bento grid asimétrico que refleja la misma
 * jerarquía que /servicios: Mentoría es el servicio PRINCIPAL (card grande,
 * fondo --bordo, con quote y sub-servicios) y Prensa + RRPP son secundarios
 * (cards simétricas claras). Es un resumen editorial; el detalle vive en
 * /servicios. Contenido hardcodeado (esta sección no pasa por el CMS); los
 * textos espejan los fallbacks de lib/servicios-schema.ts.
 */

const MENTORIA_SUBS = [
  { num: "01", title: "Auditoría y Planificación 360°" },
  { num: "02", title: "Estrategia Multiplataforma" },
  { num: "03", title: "Gestión de Alianzas Estratégicas" },
]

const SECONDARIES = [
  {
    badge: "Servicio 02",
    title: "Prensa y Comunicación Multiplataforma",
    quote: "Historias con impacto real.",
    desc:
      "Construyo puentes honestos y duraderos con periodistas. Transformo el valor periodístico de tu negocio en contenido relevante para medios tradicionales y digitales.",
    tags: ["Gestión de Medios", "Laboratorio de comunicación", "Monitoreo"],
  },
  {
    badge: "Servicio 03",
    title: "Relaciones Públicas",
    quote: "Conexión genuina para potenciar tu historia y tu red de contactos.",
    desc:
      "Diseño y coordino acciones presenciales donde el diálogo es protagonista. Conecto a profesionales con stakeholders, autoridades y líderes de opinión.",
    tags: ["RRPP y Networking Estratégico", "Lanzamientos"],
  },
]

// Card principal: scale 0.98 → 1 + fade, con delay 0.1s.
const mentoriaVariant: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_EXPO, delay: 0.1 },
  },
}

// Cards secundarias: stagger 0.15s, slide-up 20px + fade.
const secondariesContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const secondaryItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_EXPO },
  },
}

export function HomeServicios() {
  return (
    <section id="servicios" className="bg-hueso py-20 lg:py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Encabezado de sección ── */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-14 lg:mb-16"
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
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)", maxWidth: 760 }}
          >
            Conexión genuina para potenciar la voz{" "}
            <em className="font-playfair italic text-bordo">
              y el mensaje de tu negocio.
            </em>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-sans text-gris-bordo"
            style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 640 }}
          >
            Tres servicios alineados que se adaptan a cada etapa de tu negocio.
            Mentoría como columna vertebral, Prensa y Relaciones Públicas como
            brazos operativos.
          </motion.p>
        </motion.div>

        {/* ── Bento grid ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* CARD GRANDE — MENTORÍA (servicio principal) */}
          <motion.div
            variants={mentoriaVariant}
            className="relative md:col-span-2 overflow-hidden rounded-[20px] bg-bordo p-8 lg:p-14"
            style={{ minHeight: 360 }}
          >
            {/* Número grande decorativo */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-6 right-8 font-playfair font-bold text-hueso select-none"
              style={{ fontSize: 64, opacity: 0.15, lineHeight: 1 }}
            >
              01
            </span>

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14">

              {/* Columna izquierda */}
              <div className="flex flex-col">
                <p
                  className="flex items-center gap-2 font-mono uppercase text-hueso/60 mb-6"
                  style={{ fontSize: 10, letterSpacing: "0.18em" }}
                >
                  <span className="inline-block h-1 w-1 rounded-full bg-hueso/60" />
                  Servicio principal
                </p>

                <h3
                  className="font-playfair font-bold text-hueso mb-6"
                  style={{ fontSize: "clamp(26px, 2.6vw, 32px)", lineHeight: 1.1, maxWidth: "18ch" }}
                >
                  Mentoría y Asesoramiento en Comunicación Estratégica
                </h3>

                {/* Quote decorativo */}
                <div
                  className="mb-6"
                  style={{ borderLeft: "2px solid var(--color-dorado)", paddingLeft: 16 }}
                >
                  <p
                    className="font-playfair italic text-hueso/80"
                    style={{ fontSize: 18, lineHeight: 1.4 }}
                  >
                    <span aria-hidden="true" className="text-dorado" style={{ marginRight: 4 }}>
                      “
                    </span>
                    La arquitectura narrativa que tu negocio necesita.
                  </p>
                </div>

                <p
                  className="font-sans text-hueso/75 mb-8"
                  style={{ fontSize: 14, lineHeight: 1.6, maxWidth: "52ch" }}
                >
                  Un espacio de asesoramiento y mentoreo fluido desde mi
                  expertise en comunicación. Trabajo a la par de los
                  profesionales para descubrir su brillo auténtico, estructurar
                  sus mensajes clave y diseñar un plan de visibilidad
                  personalizado.
                </p>

                <Link
                  href="/#contacto"
                  className="mt-auto inline-flex w-fit items-center gap-1.5 font-sans font-semibold text-hueso underline underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ fontSize: 14 }}
                >
                  Quiero este servicio
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Columna derecha — sub-servicios */}
              <ul className="flex flex-col">
                {MENTORIA_SUBS.map((sub, i) => (
                  <li
                    key={sub.num}
                    className="flex flex-col gap-1 py-4"
                    style={
                      i > 0
                        ? { borderTop: "1px solid rgba(201,168,130,0.3)" }
                        : { paddingTop: 0 }
                    }
                  >
                    <span
                      className="font-mono text-dorado"
                      style={{ fontSize: 10, letterSpacing: "0.1em" }}
                    >
                      {sub.num}
                    </span>
                    <span
                      className="font-sans font-medium text-hueso"
                      style={{ fontSize: 13 }}
                    >
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          </motion.div>

          {/* CARDS SECUNDARIAS — PRENSA + RRPP */}
          <motion.div
            variants={secondariesContainer}
            className="contents"
          >
            {SECONDARIES.map((s) => (
              <motion.div key={s.badge} variants={secondaryItem} className="h-full">
                <Link
                  href="/#contacto"
                  className="group flex h-full flex-col rounded-2xl border border-dorado/30 bg-hueso-oscuro p-7 lg:p-10 transition-all duration-200 hover:-translate-y-0.5 hover:border-bordo/50"
                  style={{ minHeight: 320 }}
                >
                  <p
                    className="flex items-center gap-2 font-mono uppercase text-bordo mb-5"
                    style={{ fontSize: 10, letterSpacing: "0.16em" }}
                  >
                    <span className="inline-block h-1 w-1 rounded-full bg-bordo" />
                    {s.badge}
                  </p>

                  <h3
                    className="font-playfair font-bold text-negro-bordo mb-4"
                    style={{ fontSize: 22, lineHeight: 1.2 }}
                  >
                    {s.title}
                  </h3>

                  <p
                    className="font-playfair italic text-bordo mb-5"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.4,
                      borderLeft: "2px solid var(--color-dorado)",
                      paddingLeft: 12,
                    }}
                  >
                    {s.quote}
                  </p>

                  <p
                    className="font-sans text-gris-bordo mb-6"
                    style={{ fontSize: 13, lineHeight: 1.6 }}
                  >
                    {s.desc}
                  </p>

                  <p
                    className="font-mono text-gris-bordo mb-6"
                    style={{ fontSize: 10, letterSpacing: "0.04em" }}
                  >
                    {s.tags.join("  ·  ")}
                  </p>

                  <span
                    className="mt-auto inline-flex items-center gap-1.5 font-sans font-semibold text-bordo group-hover:underline underline-offset-4"
                    style={{ fontSize: 13 }}
                  >
                    Quiero este servicio
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

        {/* ── Link final a /servicios ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.1 }}
          className="mt-12 flex flex-col items-center gap-2 text-center"
        >
          <p className="font-sans text-gris-bordo" style={{ fontSize: 14 }}>
            Conocé los tres servicios en detalle
          </p>
          <Link
            href="/servicios"
            className="inline-flex items-center gap-1.5 font-sans font-semibold text-bordo underline underline-offset-4 transition-colors hover:text-bordo-oscuro"
            style={{ fontSize: 14 }}
          >
            Ver página de servicios
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
