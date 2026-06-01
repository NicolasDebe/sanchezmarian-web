"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { fadeUp, fadeUpStagger } from "@/lib/animations"

export function Hero() {
  return (
    <section className="bg-hueso">
      <div className="flex flex-col lg:flex-row min-h-screen max-w-7xl mx-auto">

        {/* LEFT: Text */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] flex flex-col justify-center order-2 lg:order-1 px-6 py-16 lg:px-16 lg:py-24"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-3">
            Estratega de comunicación · Mendoza, AR
          </motion.p>
          <span className="gold-line" />

          <h1 className="font-playfair font-bold text-negro-bordo leading-[1.15] text-3xl lg:text-5xl mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%", rotate: -1 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                Tu historia merece estar
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%", rotate: -1 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              >
                <em className="italic text-dorado">en los medios.</em>
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={fadeUp}
            className="font-sans text-base lg:text-lg text-gris-bordo leading-relaxed mb-8 max-w-[480px]"
          >
            Conecto tu marca personal o empresarial con el ecosistema de medios
            de Mendoza de forma natural, aportando valor al periodista y
            visibilidad estratégica a tu proyecto.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-bordo text-hueso px-8 py-4 rounded font-sans text-sm font-medium hover:bg-bordo-oscuro active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
            >
              Quiero aparecer en medios
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 border border-bordo text-bordo px-8 py-4 rounded font-sans text-sm font-medium hover:bg-hueso-oscuro active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
            >
              Ver mis servicios
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT: Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full lg:w-[45%] order-1 lg:order-2 relative h-[500px] lg:h-auto"
        >
          <div className="relative w-full h-full overflow-hidden lg:rounded-lg shadow-lg">
            <Image
              src="/images/hero-marian.jpg"
              alt="Marian Sánchez — Estratega de comunicación en Mendoza"
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-center"
            />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
