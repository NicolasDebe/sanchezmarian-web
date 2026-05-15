"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { CheckCircle } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const FEATURES = [
  {
    title: "Relaciones reales con periodistas",
    body: "8 años construyendo vínculos con medios de Mendoza y a nivel nacional. Esas relaciones se traducen en cobertura concreta para tus clientes.",
  },
  {
    title: "Estrategia antes de hablar",
    body: "Antes de salir a los medios, definimos qué historia contás y a quién le hablás. El mensaje correcto multiplica los resultados.",
  },
  {
    title: "Resultados documentados",
    body: "Cada aparición en medios, nota y entrevista queda registrada. Vas a ver exactamente el impacto de cada acción.",
  },
]

export function Ideas() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* ── IZQUIERDA — texto ── */}
        <div className="flex flex-col gap-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota"
          >
            El método
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.15]"
          >
            <span className="block">Una estrategia que</span>
            <em className="block text-terracota italic">pone tu historia</em>
            <span className="block">donde tiene que estar.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="font-sans text-gris-tx text-base sm:text-[1.05rem] leading-relaxed max-w-[440px]"
          >
            No es suerte ni contactos mágicos. Es saber qué historia contar,
            a quién, cuándo y cómo — para que tu mensaje llegue a las personas
            correctas.
          </motion.p>

          <ul className="flex flex-col gap-5 mt-1">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -14 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.38 + i * 0.1, ease: EASE }}
                className="flex gap-4 items-start"
              >
                <CheckCircle
                  size={17}
                  className="text-terracota mt-[3px] shrink-0"
                  strokeWidth={2}
                />
                <div>
                  <p className="font-sans font-semibold text-marino text-sm">{f.title}</p>
                  <p className="font-sans text-gris-tx text-sm leading-relaxed mt-0.5">
                    {f.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* ── DERECHA — grid asimétrico ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
          className="grid grid-cols-2 gap-4"
          style={{ gridTemplateRows: "220px 200px" }}
        >
          {/* Card grande — ocupa 2 filas, columna izquierda */}
          <div className="row-span-2 bg-marino rounded-[1.5rem] rounded-bl-[3.5rem] p-7 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
              01
            </span>
            <div>
              <p className="font-playfair text-white/20 text-7xl font-bold leading-none select-none">
                "
              </p>
              <p className="font-playfair font-bold text-white text-[1.2rem] leading-snug -mt-2">
                Aparecé en los medios que tu cliente ideal ya lee.
              </p>
            </div>
          </div>

          {/* Card pequeña — arriba derecha */}
          <div className="bg-arena rounded-[1.5rem] p-6 flex flex-col justify-between border border-lino/80">
            <span className="font-mono text-[10px] uppercase tracking-widest text-marino/40">
              Prensa
            </span>
            <p className="font-playfair font-bold text-marino text-lg leading-tight">
              Relaciones reales con periodistas
            </p>
          </div>

          {/* Card pequeña — abajo derecha */}
          <div className="bg-terracota rounded-[1.5rem] rounded-br-[3.5rem] p-6 flex flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              Impacto
            </span>
            <p className="font-playfair font-bold text-white text-lg leading-tight">
              50+ apariciones en medios reales
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
