"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TextureCardStyled } from "@/components/ui/texture-card"

/*
 * Cult-UI usado:
 * - TextureCardStyled (components/ui/texture-card.tsx): adaptación del proyecto del
 *   cult-ui texture-card, con bordes dorado de opacidad decreciente 0.20→0.10→0.08
 *   y gradiente arena→hueso-oscuro. Cubre el spec de "bordes dorado opacity decreciente".
 * Descartados:
 * - neumorph-eyebrow: colores hardcoded (#E9E3DD), no adapta a paleta bordo.
 * - minimal-card: neutral-50/100 hardcoded, estética incompatible.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const TAGS = [
  "Comunicación estratégica",
  "Prensa y medios",
  "Relaciones Públicas",
  "Marca personal",
  "Mendoza, Argentina",
]

export function Bio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="bio" ref={ref} className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-24 items-center">

        {/* ── IZQUIERDA — foto, entra desde la izquierda ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-[380px]">
            {/* Frame: TextureCardStyled con bordes dorado de opacidad decreciente */}
            <TextureCardStyled className="p-2">
              <div className="w-full aspect-[3/4] rounded-[20px] overflow-hidden bg-arena">
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-bordo/20" />
                  <div className="w-28 h-2 rounded-full bg-bordo/15" />
                  <p className="font-mono text-[10px] text-bordo/40 uppercase tracking-widest mt-2">
                    Foto · Marian
                  </p>
                </div>
              </div>
            </TextureCardStyled>

            {/* Badge flotante — abajo izquierda */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.65, duration: 0.4, ease: EASE }}
              className="absolute -bottom-5 -left-4 lg:-left-8 bg-bordo text-hueso px-5 py-4 rounded-2xl shadow-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-hueso/45 mb-1.5">
                Más de una
              </p>
              <p className="font-playfair font-bold italic text-xl leading-none">
                década
              </p>
              <p className="font-sans text-xs text-hueso/60 mt-0.5">
                en comunicación
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── DERECHA — texto, entra desde la derecha ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
          className="flex flex-col gap-6"
        >
          {/* Eyebrow */}
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo">
            Sobre Marian
          </p>

          {/* Línea dorada */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.55, ease: EASE, delay: 0.38 }}
            className="w-10 h-px bg-dorado"
          />

          {/* Título */}
          <h2 className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.15]">
            <span className="block">Mariana Sánchez,</span>
            <em className="block italic text-bordo">estratega de comunicación.</em>
          </h2>

          {/* Párrafos */}
          <div className="flex flex-col gap-4 font-sans text-gris-bordo text-base leading-[1.8] max-w-[480px]">
            <p>
              Saber qué historia contar, a quién y en qué momento.
              Conecto tu marca personal o empresarial con el ecosistema
              de medios de Mendoza de forma natural, aportando valor
              al periodista y visibilidad estratégica a tu proyecto.
            </p>
            <p>
              Mi nombre es Marian Sánchez y ayudo a empresas y marcas
              personales a transformar su propósito en noticias,
              conectando su propuesta de valor con los canales de
              comunicación adecuados. Llevo más de una década
              construyendo vínculos reales con los protagonistas
              de los medios locales.
            </p>
            <p>
              Mi enfoque no se limita a la difusión masiva; se basa
              en el vínculo real. Entiendo el ADN de cada cliente
              para identificar exactamente qué periodista o medio de
              comunicación está buscando esa historia. Diseño estrategias
              personalizadas, adaptadas a las necesidades de cada
              proyecto, porque cada marca tiene un ritmo, un tono y un
              objetivo diferente.
            </p>
          </div>

          {/* Tags con hover */}
          <ul className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <li
                key={tag}
                className="font-sans text-xs px-3 py-1.5 rounded-full border border-bordo/40 text-bordo cursor-default transition-colors duration-200 hover:bg-bordo hover:text-hueso hover:border-bordo"
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* Link con underline animado */}
          <Link
            href="/sobre-marian"
            className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-bordo w-fit"
          >
            <span className="relative">
              Leer más sobre mí
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 h-px w-0 bg-bordo group-hover:w-full transition-[width] duration-300 ease-out"
              />
            </span>
            <ArrowRight
              size={14}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
