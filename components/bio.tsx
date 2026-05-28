"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TextureCardStyled } from "@/components/ui/texture-card"
import { fadeLeft, fadeRight, fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"

const TAGS = [
  "Comunicación estratégica",
  "Prensa y medios",
  "Relaciones Públicas",
  "Mendoza, Argentina",
]

export function Bio() {
  return (
    <section id="bio" className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-24 items-center">

        {/* ── IZQUIERDA — foto ── */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-[380px]">
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

            {/* Badge flotante */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={viewportOnce}
              transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

        {/* ── DERECHA — texto ── */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-6"
        >
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-6"
          >
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo">
              Sobre Marian
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              variants={fadeUp}
              className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.15]"
            >
              <span className="block">Mariana Sánchez,</span>
              <em className="block italic text-bordo">estratega de comunicación.</em>
            </motion.h2>

            <motion.div variants={fadeUp} className="flex flex-col gap-4 font-sans text-gris-bordo text-base leading-[1.8] max-w-[480px]">
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
              <p>
                Entiendo la comunicación como una sinergia donde todas las
                partes ganan. Mi metodología no solo busca el beneficio del
                cliente, sino que se enfoca en brindar un valor agregado al
                periodista. Al entregar contenido de calidad, chequeado y de
                interés genuino, facilito la labor informativa de los medios,
                generando una relación de respeto y colaboración que perdura.
              </p>
            </motion.div>

            <motion.ul variants={fadeUp} className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <li
                  key={tag}
                  className="font-sans text-xs px-3 py-1.5 rounded-full border border-bordo/40 text-bordo cursor-default transition-colors duration-200 hover:bg-bordo hover:text-hueso hover:border-bordo"
                >
                  {tag}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp}>
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
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
