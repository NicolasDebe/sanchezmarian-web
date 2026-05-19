"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

const PASOS = [
  {
    num: "01",
    title: "Definición del relato y audiencia",
    body: "Trabajamos puertas adentro para definir qué historia vamos a contar y a quién le vamos a hablar. Un mensaje bien diseñado multiplica los resultados.",
  },
  {
    num: "02",
    title: "Diseño de la estrategia",
    body: "Creo un plan de comunicación a medida — orgánico, mixto o comercial — según la naturaleza de tu producto o servicio. Una vez aprobada la estrategia, comienzo con la acción.",
  },
  {
    num: "03",
    title: "Gestión de contenidos y relacionamiento",
    body: "Coordino el material necesario y activo mi red de contactos construida durante más de una década en los medios de Mendoza, gestionando de forma personal el interés de los periodistas en tu temática.",
  },
  {
    num: "04",
    title: "Monitoreo",
    body: "Superviso cada interacción de la campaña. Si tu proyecto requiere servicios complementarios, actúo como nexo con un ecosistema de colegas profesionales para asegurar coherencia en toda la comunicación.",
  },
  {
    num: "05",
    title: "Análisis de impacto y proyecciones",
    body: "Entrego un clipping de prensa detallado con la medición de impacto de cada aparición, nota y entrevista. No solo verás dónde saliste — analizaremos los resultados y definiremos las próximas etapas juntos.",
  },
]

export function Ideas() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Header centrado ── */}
        <div className="flex flex-col items-center text-center mb-20 lg:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-bordo-claro/70 mb-5"
          >
            Mi método de trabajo
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="font-playfair font-bold text-negro-bordo text-[2.25rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.1] max-w-[640px] mb-6"
          >
            Saber qué decir,{" "}
            <em className="italic text-bordo-claro">a quién y cuándo.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="font-sans text-gris-bordo text-base leading-relaxed max-w-[520px]"
          >
            No se trata solo de aparecer en los medios, sino de hacerlo con el
            mensaje correcto, en el momento preciso y ante la audiencia indicada.
          </motion.p>
        </div>

        {/* ── 5 pasos — grid 2-3 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {PASOS.map((paso, i) => (
            <motion.div
              key={paso.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.12, ease: EASE }}
              className="flex flex-col gap-5"
            >
              <span className="font-playfair italic text-bordo text-[2.5rem] font-bold leading-none">
                {paso.num}
              </span>

              <div className="w-10 h-px bg-dorado" />

              <p className="font-sans font-semibold text-negro-bordo text-base">
                {paso.title}
              </p>

              <p className="font-sans text-gris-bordo text-sm leading-relaxed">
                {paso.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Separador dorado inferior ── */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          className="w-full h-px bg-dorado/25 mt-20 lg:mt-24"
        />

      </div>
    </section>
  )
}
