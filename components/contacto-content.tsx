"use client"

import { motion } from "motion/react"
import { Mail, MapPin, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import {
  fadeUp, fadeLeft, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"
import { fallbacksFor } from "@/lib/contacto-schema"
import { RichText } from "@/components/ui/RichText"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
}

function ContactoHero({ c }: { c: Record<string, string> }) {
  return (
    <section
      className="flex flex-col sm:flex-row items-center flex-wrap mx-auto"
      style={{
        maxWidth: "1280px",
        padding: "clamp(48px, 8vh, 100px) clamp(20px, 5vw, 64px)",
        gap: "clamp(32px, 6vw, 80px)",
      }}
    >
      {/* FOTO CIRCULAR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ flexShrink: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/NAC_4230.jpg"
          alt="Marian Sánchez — conversemos"
          className="w-[110px] h-[110px] sm:w-[clamp(130px,16vw,210px)] sm:h-[clamp(130px,16vw,210px)]"
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
            border: "2.5px solid rgba(102,0,31,0.2)",
            boxShadow: "0 0 0 8px rgba(102,0,31,0.06)",
          }}
        />
      </motion.div>

      {/* TEXTO */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center sm:text-left"
        style={{ flex: 1, minWidth: "260px" }}
      >
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#66001F",
            opacity: 0.65,
            marginBottom: "16px",
          }}
        >
          {c.eyebrow}
        </motion.p>

        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: "Playfair Display, serif",
            color: "#1A0008",
            fontWeight: 700,
            margin: 0,
          }}
        >
          <span style={{ display: "block", fontSize: "clamp(1.3rem, 2.5vw, 2rem)", fontWeight: 600, opacity: 0.82 }}>
            {c.h1_pre}
          </span>
          <em style={{ display: "block", fontSize: "clamp(1.9rem, 4vw, 3.2rem)", fontStyle: "italic", color: "#66001F", lineHeight: 1.0 }}>
            {c.h1_accent}
          </em>
        </motion.h1>
      </motion.div>
    </section>
  )
}

export function ContactoContent({
  content,
}: {
  content?: {
    hero?: Record<string, string>
    info?: Record<string, string>
    faq?: Record<string, string>
  }
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const info = { ...fallbacksFor("info"), ...content?.info }
  const faq = { ...fallbacksFor("faq"), ...content?.faq }

  const INFO_ITEMS = [
    { icon: Mail, label: "Email", value: info.email, href: `mailto:${info.email}` },
    { icon: MapPin, label: "Ubicación", value: info.location, href: null as string | null },
    { icon: MessageCircle, label: "Disponibilidad", value: info.availability, href: null as string | null },
  ]
  const FAQ = [1, 2, 3, 4].map((n) => ({ q: faq[`q${n}`] ?? "", a: faq[`a${n}`] ?? "" }))

  return (
    <>
      <ContactoHero c={hero} />

      {/* ── Contacto principal ── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-20 items-start">

          {/* Izquierda — info */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-10"
          >
            <motion.div
              variants={fadeUpStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="flex flex-col gap-3"
            >
              <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota">
                {info.eyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-playfair font-bold text-marino text-[2rem] leading-[1.1]">
                {info.title_pre}<br />
                <em className="italic text-terracota">{info.title_accent}</em>
              </motion.h2>
            </motion.div>

            <motion.div
              variants={fadeUpStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="flex flex-col gap-5"
            >
              {INFO_ITEMS.map(({ icon: Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-arena flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-terracota" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gris-tx/50 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="font-sans text-sm text-marino hover:text-terracota transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-sm text-marino">{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="pt-6 border-t border-marino/10"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-tx/50 mb-4">
                También en redes
              </p>
              <div className="flex gap-3">
                {[
                  { label: "LinkedIn", href: info.linkedin_url },
                  { label: "Instagram", href: info.instagram_url },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm font-medium text-marino/60 hover:text-terracota border border-marino/15 hover:border-terracota/40 px-4 py-2 rounded-full transition-all"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Derecha — formulario */}
          <motion.div
            variants={revealCard}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="bg-arena rounded-2xl p-8 lg:p-10"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota mb-2">
              {info.form_eyebrow}
            </p>
            <p className="font-playfair font-bold text-marino text-xl mb-8">
              {info.form_title}
            </p>
            <ContactForm />
          </motion.div>

        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className="py-20 lg:py-24"
        style={{
          background: "radial-gradient(ellipse at 40% 30%, rgba(140,26,53,0.25) 0%, transparent 60%), var(--color-bordo-oscuro)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mb-12"
          >
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
              {faq.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-playfair font-bold text-white text-[2rem] sm:text-[2.5rem] leading-[1.1]">
              {faq.title_pre}<br />
              <em className="italic text-terracota">{faq.title_accent}</em>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {FAQ.map((item) => (
              <motion.div
                key={item.q}
                variants={revealCard}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-3"
              >
                <h3 className="font-playfair font-bold text-white text-base leading-snug">
                  {item.q}
                </h3>
                <RichText html={item.a} className="rich-inline font-sans text-white/55 text-sm leading-relaxed" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
