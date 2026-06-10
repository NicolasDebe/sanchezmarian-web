"use client"

import { motion } from "motion/react"
import { fadeUp, fadeUpStagger, fadeLeft, viewportOnce } from "@/lib/animations"
import { fallbacksFor, fallbackOf } from "@/lib/home-schema"

export function Ideas({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("metodo"), ...content }
  const PASOS = [1, 2, 3, 4, 5].map((n) => ({
    num: String(n).padStart(2, "0"),
    title: c[`step_${n}_title`] ?? "",
    body: c[`step_${n}_desc`] ?? "",
  }))

  // Título: si no fue editado, conserva el acento editorial en italic/bordo.
  const titleIsDefault = c.title === fallbackOf("metodo", "title")

  return (
    <section className="bg-hueso-oscuro py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Header centrado ── */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-center text-center mb-20 lg:mb-24"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-bordo-claro/70 mb-5"
          >
            {c.eyebrow}
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo text-[2.25rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.1] max-w-[640px]"
          >
            {titleIsDefault ? (
              <>
                Saber qué decir,{" "}
                <em className="italic text-bordo-claro">a quién y cuándo.</em>
              </>
            ) : (
              c.title
            )}
          </motion.h2>
        </motion.div>

        {/* ── Stepper vertical ── */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-2xl mx-auto"
        >
          {PASOS.map((paso, i) => {
            const isLast = i === PASOS.length - 1
            return (
              <motion.div
                key={paso.num}
                variants={fadeLeft}
                className="flex gap-8"
              >
                {/* Columna izquierda — número + línea conectora */}
                <div className="flex flex-col items-center shrink-0 w-12">
                  <span className="font-playfair italic font-bold text-bordo text-[2rem] leading-none">
                    {paso.num}
                  </span>
                  {!isLast && (
                    <div className="flex-1 w-px bg-dorado/50 my-3 min-h-[2.5rem]" />
                  )}
                </div>

                {/* Columna derecha — contenido */}
                <div className={`flex flex-col gap-1 ${isLast ? "" : "pb-10"}`}>
                  <p className="font-sans font-semibold text-negro-bordo text-base">
                    {paso.title}
                  </p>
                  <p className="font-sans text-gris-bordo text-sm leading-relaxed">
                    {paso.body}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Separador dorado inferior ── */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full h-px bg-dorado/25 mt-20 lg:mt-24"
        />

      </div>
    </section>
  )
}
