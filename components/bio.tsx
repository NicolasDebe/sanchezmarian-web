"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TextureCardStyled } from "@/components/ui/texture-card"
import { fadeRight, fadeUp, fadeUpStagger, viewportOnce } from "@/lib/animations"
import { fallbacksFor } from "@/lib/home-schema"
import { RichText } from "@/components/ui/RichText"

export function Bio({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("bio"), ...content }
  const TAGS = [c.tag_1, c.tag_2, c.tag_3, c.tag_4].filter(Boolean)

  return (
    <section id="bio" className="bg-hueso-oscuro py-[120px] lg:py-[160px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">

        {/* ── IZQUIERDA — foto ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-[460px]">
            {/* Decorative glow behind photo */}
            <div
              className="absolute -bottom-6 -right-6 w-[70%] h-[70%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(201,168,130,0.18) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />
            <TextureCardStyled className="p-2 relative" style={{ zIndex: 1 }}>
              <div className="relative w-full rounded-[20px] overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="/images/NAC_4133.jpg"
                  alt="Marian Sánchez — comunicación con propósito"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center top",
                    borderRadius: "12px",
                  }}
                />

                {/* Badge sobre la foto */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-4 left-4 px-4 py-2 rounded-xl shadow-lg"
                  style={{ backgroundColor: "#66001F" }}
                >
                  <p
                    className="font-mono text-[11px] uppercase tracking-widest leading-none"
                    style={{ color: "#FEFCEF" }}
                  >
                    {c.badge}
                  </p>
                </motion.div>
              </div>
            </TextureCardStyled>
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
              {c.eyebrow}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              variants={fadeUp}
              className="font-playfair font-bold text-negro-bordo text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] leading-[1.15]"
            >
              <span className="block">{c.title_pre}</span>
              <em className="block italic text-bordo">{c.title_accent}</em>
            </motion.h2>

            <motion.div variants={fadeUp} className="flex flex-col gap-4 font-sans text-gris-bordo text-base leading-[1.8] max-w-[480px]">
              <RichText html={c.paragraph_1} className="rich-inline" />
              <RichText html={c.paragraph_2} className="rich-inline" />
              <RichText html={c.paragraph_3} className="rich-inline" />
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
                href="/mis-valores"
                className="group inline-flex items-center gap-2.5 font-sans text-sm font-semibold text-bordo border border-bordo/40 px-5 py-2.5 rounded-full w-fit hover:bg-bordo hover:text-hueso hover:border-bordo transition-all duration-300"
              >
                {c.link_text}
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
