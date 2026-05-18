"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { TextureOverlay } from "@/components/ui/texture-overlay"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: EASE, delay },
})

export function Hero() {
  return (
    <section className="relative min-h-screen bg-hueso flex items-center overflow-hidden pt-20">
      <TextureOverlay texture="paperGrain" opacity={0.18} />

      {/* Decorative gradient — very subtle */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 20%, rgba(201,168,130,0.08) 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle at 20% 80%, rgba(102,0,31,0.05) 0%, transparent 65%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-12 xl:gap-20 items-center py-16 lg:py-24">

        {/* ── LEFT ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-7">

          {/* Eyebrow */}
          <motion.p
            {...fadeUp(0.15)}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/80"
          >
            Consultora de comunicación · Mendoza, AR
          </motion.p>

          {/* H1 */}
          <div>
            <h1 className="font-playfair font-bold text-negro-bordo leading-[1.1] text-[2.4rem] sm:text-[3rem] lg:text-[3.25rem] xl:text-[3.75rem]">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                >
                  Tu historia merece
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.38 }}
                >
                  estar{" "}
                  <em className="text-bordo-claro italic">en los medios.</em>
                </motion.span>
              </span>
            </h1>
          </div>

          {/* Línea dorada decorativa */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
            className="w-14 h-px bg-dorado"
          />

          {/* Body */}
          <motion.p
            {...fadeUp(0.6)}
            className="font-sans text-gris-bordo text-base sm:text-[1.05rem] leading-relaxed max-w-[440px]"
          >
            Ayudo a marcas y profesionales a aparecer en los medios que importan.
            Comunicación estratégica con relaciones reales con periodistas.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.7)} className="flex flex-wrap gap-3 pt-1">
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 bg-bordo text-hueso px-7 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-bordo-oscuro active:scale-[0.98] transition-all"
            >
              Quiero aparecer en medios
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center gap-2 border border-bordo/20 text-bordo px-7 py-3.5 rounded-full font-sans text-sm font-medium hover:border-bordo/50 hover:bg-bordo/4 transition-all"
            >
              Ver mis servicios
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div {...fadeUp(0.8)} className="flex items-center gap-3 pt-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C9A882">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="font-sans text-sm text-gris-bordo">
              <span className="font-medium text-negro-bordo">30+ clientes</span> confían en mi trabajo
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT — FOTO ── */}
        <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="relative"
          >
            {/* Marco decorativo offset — dorado */}
            <div className="absolute top-5 right-5 w-full max-w-[420px] aspect-[4/5] rounded-[2rem] border border-dorado/30 pointer-events-none" />

            {/* Foto */}
            <div className="relative w-[300px] sm:w-[360px] lg:w-[400px] xl:w-[440px] aspect-[4/5]">
              <div
                className="w-full h-full rounded-[2rem] overflow-hidden"
                style={{ background: "linear-gradient(145deg, #F0E8D8 0%, #e8dcc8 50%, #d9ccb6 100%)" }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-bordo/20" />
                  <div className="w-28 h-2 rounded-full bg-bordo/15" />
                  <p className="font-mono text-[10px] text-bordo/40 uppercase tracking-widest mt-2">
                    Foto · Marian
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-dorado/15 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bordo/30">Scroll</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-bordo/25 to-transparent"
        />
      </motion.div>
    </section>
  )
}
