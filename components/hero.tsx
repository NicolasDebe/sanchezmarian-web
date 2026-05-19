"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">

      {/* ── BACKGROUND placeholder — reemplazar con <Image> cuando llegue la foto ── */}
      <div className="absolute inset-0 bg-arena flex items-center justify-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bordo/25">
          Foto de Marian — 100% pantalla
        </p>
      </div>

      {/* ── OVERLAY: oscuro abajo, transparente arriba ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(26,0,8,0.92) 0%, rgba(26,0,8,0.55) 42%, rgba(26,0,8,0.0) 100%)",
        }}
      />

      {/* ── CONTENIDO — anclado al fondo izquierdo ── */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28">
          <div className="flex flex-col gap-6 max-w-[600px]">

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.3 }}
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-hueso/70"
            >
              Consultora de comunicación · Mendoza, AR
            </motion.p>

            <h1 className="font-playfair font-bold text-hueso leading-[1.0] text-[2.75rem] sm:text-[3.75rem] lg:text-[4.75rem]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
                >
                  Tu historia merece
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.62 }}
                >
                  estar{" "}
                  <em className="italic">en los medios.</em>
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.78 }}
              className="font-sans text-hueso/80 text-base sm:text-[1.05rem] leading-relaxed max-w-[480px]"
            >
              Saber qué historia contar, a quién y en qué momento.
              Conecto tu marca personal o empresarial con el ecosistema
              de medios de Mendoza de forma natural, aportando valor
              al periodista y visibilidad estratégica a tu proyecto.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.92 }}
              className="flex flex-wrap gap-3 pt-1"
            >
              <Link
                href="#contacto"
                className="inline-flex items-center gap-2 bg-hueso text-bordo px-7 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-arena active:scale-[0.98] transition-all"
              >
                Quiero aparecer en medios
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <Link
                href="#servicios"
                className="inline-flex items-center gap-2 border border-hueso/50 text-hueso px-7 py-3.5 rounded-full font-sans text-sm font-medium hover:border-hueso hover:bg-hueso/10 transition-all"
              >
                Ver mis servicios
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-10 right-8 lg:right-12 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-hueso/40 to-transparent"
        />
      </motion.div>

    </section>
  )
}
