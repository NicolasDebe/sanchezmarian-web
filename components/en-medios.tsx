"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { fadeUp, fadeLeft, fadeUpStagger, viewportOnce } from "@/lib/animations"

type MedioItem = { name: string; href: string; dim?: boolean }

const FILAS: { label: string; size: number; medios: MedioItem[] }[] = [
  {
    label: "Internacional",
    size: 15,
    medios: [
      { name: "Vatican News",         href: "/casos-de-exito" },
      { name: "L'Osservatore Romano", href: "/casos-de-exito" },
      { name: "ACI Prensa",           href: "/casos-de-exito" },
      { name: "Bio Bio Chile",        href: "/casos-de-exito" },
      { name: "Vida Nueva",           href: "/casos-de-exito" },
    ],
  },
  {
    label: "Nacional",
    size: 17,
    medios: [
      { name: "La Nación", href: "/casos-de-exito" },
      { name: "Clarín",    href: "/casos-de-exito" },
      { name: "Infobae",   href: "/casos-de-exito" },
      { name: "Cadena 3",  href: "/casos-de-exito" },
    ],
  },
  {
    label: "Regional",
    size: 15,
    medios: [
      { name: "La Gaceta",          href: "/casos-de-exito" },
      { name: "La Voz del Interior", href: "/casos-de-exito" },
      { name: "Entorno Económico",  href: "/casos-de-exito" },
    ],
  },
  {
    label: "Local",
    size: 13,
    medios: [
      { name: "Los Andes",    href: "/casos-de-exito" },
      { name: "MDZ Online",   href: "/casos-de-exito" },
      { name: "Canal 9",      href: "/casos-de-exito" },
      { name: "Canal 7",      href: "/casos-de-exito" },
      { name: "El Sol",       href: "/casos-de-exito" },
      { name: "Diario UNO",   href: "/casos-de-exito" },
      { name: "Mendovoz",     href: "/casos-de-exito" },
    ],
  },
]

const DOT = (
  <span
    aria-hidden
    style={{ color: "var(--color-dorado)", opacity: 0.7, userSelect: "none", fontSize: "inherit" }}
  >
    ·
  </span>
)

export function EnMedias() {
  return (
    <section id="medios" className="bg-hueso-oscuro">

      {/* ── BLOQUE A — El número ── */}
      <div
        className="flex flex-col items-center text-center px-6"
        style={{ paddingTop: 120, paddingBottom: 80 }}
      >
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="font-mono uppercase text-bordo"
          style={{ fontSize: 10, letterSpacing: "0.2em" }}
        >
          Apariciones verificadas
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-6 flex flex-wrap items-baseline justify-center leading-none"
          style={{ gap: "0 0.2em" }}
        >
          <span
            className="font-playfair text-negro-bordo"
            style={{
              fontSize: "clamp(120px, 18vw, 200px)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            +100
          </span>
          <em
            className="font-playfair italic text-bordo"
            style={{
              fontSize: "clamp(120px, 18vw, 200px)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            reales.
          </em>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="font-sans text-gris-bordo mt-8"
          style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.65 }}
        >
          En medios locales, provinciales, nacionales e internacionales.
          Desde Mendoza al Vaticano.
        </motion.p>
      </div>

      {/* ── BLOQUE B — Los nombres de los medios ── */}
      <div
        className="max-w-7xl mx-auto"
        style={{ paddingLeft: "clamp(20px, 5vw, 40px)", paddingRight: "clamp(20px, 5vw, 40px)", paddingBottom: 80 }}
      >
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col"
        >
          {FILAS.map((fila, fi) => (
            <motion.div
              key={fila.label}
              variants={fadeLeft}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 py-5 sm:py-6"
              style={
                fi < FILAS.length - 1
                  ? { borderBottom: "1px solid rgba(201,168,130,0.15)" }
                  : undefined
              }
            >
              {/* Fila label */}
              <span
                className="font-mono uppercase text-bordo sm:w-[110px] sm:shrink-0"
                style={{ fontSize: 9, letterSpacing: "0.18em", opacity: 0.5 }}
              >
                {fila.label}
              </span>

              {/* Nombres — wrap en todos los tamaños (en mobile evita el
                  scroll horizontal oculto, poco descubrible) */}
              <div
                className="flex flex-wrap items-center"
                style={{ gap: "0 0.5rem" }}
              >
                {fila.medios.map((medio, mi) => (
                  <span key={medio.name} className="inline-flex items-center gap-2 whitespace-nowrap">
                    {mi > 0 && DOT}
                    <Link
                      href={medio.href}
                      className="font-sans text-negro-bordo transition-colors duration-150 hover:text-bordo"
                      style={{
                        fontSize: fila.size,
                        opacity: medio.dim ? 0.45 : 1,
                        fontStyle: medio.dim ? "italic" : "normal",
                      }}
                    >
                      {medio.name}
                    </Link>
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA — alineado a la derecha */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex justify-end mt-8"
        >
          <Link
            href="/casos-de-exito"
            className="inline-flex items-center gap-2 font-sans text-bordo hover:opacity-70 transition-opacity group"
            style={{ fontSize: 13 }}
          >
            Ver los +100 casos
            <ArrowRight size={13} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

    </section>
  )
}
