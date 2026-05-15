"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const TYPE_COLORS: Record<string, string> = {
  Digital:  "bg-marino/8 text-marino",
  Gráfico:  "bg-terracota/10 text-terracota",
  Radio:    "bg-lino text-marino",
  TV:       "bg-marino-osc/8 text-marino-osc",
}

const MEDIOS = [
  {
    medio: "La Nación",
    type: "Gráfico",
    headline: "Cómo construir una marca personal sólida en el mercado actual",
    year: "2024",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    headline: "Las claves para que tu negocio aparezca en los medios que importan",
    year: "2024",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    headline: "Consultoras mendocinas que transforman la comunicación empresarial",
    year: "2023",
  },
  {
    medio: "Infobae",
    type: "Digital",
    headline: "Estrategias de prensa para emprendedores y profesionales independientes",
    year: "2024",
  },
  {
    medio: "Radio Nihuil",
    type: "Radio",
    headline: "Comunicación estratégica: cómo hablarle a tu audiencia ideal",
    year: "2023",
  },
  {
    medio: "Diario UNO",
    type: "Digital",
    headline: "El rol de la comunicación en el crecimiento de las PyMEs mendocinas",
    year: "2023",
  },
]

export function EnMedias() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="medios" ref={ref} className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota mb-4"
            >
              En medios
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
              className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] leading-[1.15]"
            >
              <span className="block">Historias que</span>
              <em className="block italic text-terracota">llegaron a los medios.</em>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/en-medios"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-marino hover:text-terracota transition-colors group"
            >
              Ver todas las apariciones
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MEDIOS.map((item, i) => (
            <motion.article
              key={item.medio + i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.07, ease: EASE }}
              className="group relative bg-white border border-marino/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-marino/25 hover:shadow-[0_8px_30px_-8px_rgba(28,46,74,0.12)] transition-all duration-300 cursor-pointer"
            >
              {/* Header: medio + type badge */}
              <div className="flex items-center justify-between">
                <p className="font-playfair font-bold text-marino text-lg">{item.medio}</p>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
                    TYPE_COLORS[item.type] ?? "bg-lino text-marino"
                  }`}
                >
                  {item.type}
                </span>
              </div>

              {/* Headline */}
              <p className="font-sans text-gris-tx text-sm leading-relaxed flex-1">
                {item.headline}
              </p>

              {/* Footer: año + link icon */}
              <div className="flex items-center justify-between pt-1 border-t border-marino/6">
                <span className="font-mono text-[11px] text-gris-tx/60">{item.year}</span>
                <ExternalLink
                  size={13}
                  className="text-marino/25 group-hover:text-terracota transition-colors"
                  strokeWidth={1.5}
                />
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}
