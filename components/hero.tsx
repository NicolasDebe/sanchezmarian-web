"use client"

import { motion } from "motion/react"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { TextureOverlay } from "@/components/ui/texture-overlay"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
})

export function Hero() {
  return (
    <section className="relative min-h-screen bg-arena flex items-center overflow-hidden pt-20">
      {/* Paper grain texture */}
      <TextureOverlay texture="paperGrain" opacity={0.35} />

      {/* Decorative blob top-right */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(193,100,74,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Decorative blob bottom-left */}
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(28,46,74,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-12 xl:gap-20 items-center py-16 lg:py-24">

        {/* ── LEFT COLUMN ── */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">

          {/* Eyebrow */}
          <motion.p
            {...fadeUp(0.1)}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota font-medium"
          >
            Consultora de comunicación · Mendoza, AR
          </motion.p>

          {/* H1 — text-reveal por línea, sin word-wrap inesperado */}
          <div>
            <h1 className="font-playfair font-bold text-marino leading-[1.12] text-[2.4rem] sm:text-[3rem] lg:text-[3.25rem] xl:text-[3.75rem]">
              {/* Línea 1 */}
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.2 }}
                >
                  Tu historia merece
                </motion.span>
              </span>
              {/* Línea 2 */}
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.36 }}
                >
                  estar{" "}
                  <em className="text-terracota italic">en los medios.</em>
                </motion.span>
              </span>
            </h1>
          </div>

          {/* Body */}
          <motion.p
            {...fadeUp(0.55)}
            className="font-sans text-gris-tx text-base sm:text-lg leading-relaxed max-w-md"
          >
            Ayudo a marcas y profesionales a aparecer en los medios que importan.
            Comunicación estratégica con relaciones reales con periodistas.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.65)} className="flex flex-wrap gap-3 pt-1">
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 bg-terracota text-white px-6 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 active:scale-[0.98] transition-all"
            >
              Quiero aparecer en medios
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="#servicios"
              className="inline-flex items-center gap-2 border border-marino/25 text-marino px-6 py-3.5 rounded-full font-sans text-sm font-medium hover:border-marino/60 hover:bg-marino/5 transition-all"
            >
              Ver mis servicios
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div {...fadeUp(0.75)} className="flex items-center gap-3 pt-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-terracota text-terracota" />
              ))}
            </div>
            <p className="font-sans text-sm text-gris-tx">
              <span className="font-semibold text-marino">30+ clientes</span> confían en mi trabajo
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — PHOTO ── */}
        <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            {/* Photo frame */}
            <div className="relative w-[320px] sm:w-[380px] lg:w-[420px] xl:w-[460px] aspect-[4/5]">
              {/* Photo placeholder — reemplazar con <Image> cuando Marian envíe la foto */}
              <div
                className="w-full h-full rounded-[2rem] rounded-br-[5rem] overflow-hidden"
                style={{ background: "linear-gradient(145deg, #D8C9B8 0%, #c4b39f 50%, #b09b84 100%)" }}
              >
                {/* Placeholder visual */}
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-40">
                  <div className="w-24 h-24 rounded-full bg-marino/30" />
                  <div className="w-32 h-3 rounded-full bg-marino/20" />
                  <p className="font-mono text-xs text-marino/50 uppercase tracking-widest mt-2">
                    Foto · Marian
                  </p>
                </div>
              </div>

              {/* Inner subtle overlay for depth */}
              <div className="absolute inset-0 rounded-[2rem] rounded-br-[5rem] ring-1 ring-inset ring-white/20 pointer-events-none" />
            </div>

            {/* Floating badge — top-left */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -left-6 top-10 bg-marino text-white px-4 py-3 rounded-2xl shadow-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mb-0.5">
                Resultados
              </p>
              <p className="font-playfair font-bold text-2xl leading-none">50+</p>
              <p className="font-sans text-xs text-white/80 mt-0.5">apariciones en medios</p>
            </motion.div>

            {/* Floating badge — bottom-right */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-4 bottom-12 bg-terracota text-white px-4 py-3 rounded-2xl shadow-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/70 mb-0.5">
                Experiencia
              </p>
              <p className="font-playfair font-bold text-2xl leading-none">8 años</p>
              <p className="font-sans text-xs text-white/80 mt-0.5">en comunicación</p>
            </motion.div>

            {/* Decorative dot pattern behind photo */}
            <div
              className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-60"
              style={{
                background:
                  "radial-gradient(circle_at_2px_2px, #D8C9B8 1px, transparent 0) 0 0 / 12px 12px",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marino/40">Scroll</p>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-marino/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}
