"use client"

import { motion } from "motion/react"
import Image from "next/image"
import { Mail, MapPin, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import portraitContacto from "@/public/images/NAC_4230.jpg"
import {
  fadeUp, fadeLeft, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"
import { fallbacksFor } from "@/lib/contacto-schema"
import { RichText } from "@/components/ui/RichText"
import { HeroWords, heroNextLineDelay, heroSatelliteDelay, useHeroSatellite } from "@/components/ui/hero-reveal"
import { fsStyle, type FieldScaleMap } from "@/lib/text-size"

function ContactoHero({ c, scales }: { c: Record<string, string>; scales?: FieldScaleMap }) {
  const satDelay = heroSatelliteDelay(c.h1_pre, c.h1_accent)
  const satellite = useHeroSatellite(satDelay)

  return (
    <section
      className="flex flex-col sm:flex-row items-center flex-wrap mx-auto"
      style={{
        maxWidth: "1280px",
        padding: "clamp(48px, 8vh, 100px) clamp(20px, 5vw, 64px)",
        gap: "clamp(32px, 6vw, 80px)",
      }}
    >
      {/* FOTO CIRCULAR — satélite con scale-in, entra tras el título */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: satDelay + 0.1 }}
        style={{ flexShrink: 0 }}
      >
        <Image
          src={portraitContacto}
          alt="Marian Sánchez — conversemos"
          placeholder="blur"
          sizes="(min-width: 640px) 210px, 110px"
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
      <div className="text-center sm:text-left" style={{ flex: 1, minWidth: "260px" }}>
        <motion.p
          {...satellite(0)}
          {...fsStyle(scales?.["hero.eyebrow"], {
            fontFamily: "DM Mono, monospace",
            fontSize: "var(--fs-eyebrow)",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "#66001F",
            opacity: 0.65,
            marginBottom: "16px",
          }, "hero.eyebrow")}
        >
          {c.eyebrow}
        </motion.p>

        <h1
          aria-label={`${c.h1_pre} ${c.h1_accent}`}
          {...fsStyle(scales?.["hero.h1_pre"], {
            fontFamily: "Playfair Display, serif",
            color: "#1A0008",
            fontWeight: 700,
            margin: 0,
          }, "hero.h1_pre")}
        >
          <HeroWords
            text={c.h1_pre}
            as="span"
            ariaHidden
            style={{ display: "block", fontSize: "calc(clamp(1.3rem, 2.5vw, 2rem) * var(--text-scale))", fontWeight: 600, opacity: 0.82 }}
          />
          <HeroWords
            text={c.h1_accent}
            as="em"
            ariaHidden
            delay={heroNextLineDelay(c.h1_pre)}
            style={{ display: "block", fontSize: "calc(clamp(1.9rem, 4vw, 3.2rem) * var(--text-scale))", fontStyle: "italic", color: "#66001F", lineHeight: "var(--lh-tight)" }}
          />
        </h1>
      </div>
    </section>
  )
}

export function ContactoContent({
  content,
  scales,
}: {
  content?: {
    hero?: Record<string, string>
    info?: Record<string, string>
    faq?: Record<string, string>
  }
  scales?: FieldScaleMap
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const info = { ...fallbacksFor("info"), ...content?.info }
  const faq = { ...fallbacksFor("faq"), ...content?.faq }

  // `field` es la clave editable del dato (el `label` del ícono es fijo por
  // diseño): con ella armamos el data-fkey de tamaño/fuente de cada valor.
  const INFO_ITEMS = [
    { icon: Mail, field: "email", label: "Email", value: info.email, href: `mailto:${info.email}` },
    { icon: MapPin, field: "location", label: "Ubicación", value: info.location, href: null as string | null },
    { icon: MessageCircle, field: "availability", label: "Disponibilidad", value: info.availability, href: null as string | null },
  ]
  const FAQ = [1, 2, 3, 4].map((n) => ({ n, q: faq[`q${n}`] ?? "", a: faq[`a${n}`] ?? "" }))

  return (
    <>
      <ContactoHero c={hero} scales={scales} />

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
              <motion.p variants={fadeUp} className="font-mono uppercase tracking-[0.22em] text-terracota" {...fsStyle(scales?.["info.eyebrow"], { fontSize: "var(--fs-eyebrow)" }, "info.eyebrow")}>
                {info.eyebrow}
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-playfair font-bold text-marino text-[calc(2rem*var(--text-scale))] leading-[1.1]" {...fsStyle(scales?.["info.title_pre"], undefined, "info.title_pre")}>
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
              {INFO_ITEMS.map(({ icon: Icon, field, label, value, href }) => (
                <motion.div key={field} variants={fadeUp} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-arena flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-terracota" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-[0.12em] text-gris-tx/50 mb-0.5" style={{ fontSize: "var(--fs-micro)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="font-sans text-marino hover:text-terracota transition-colors" {...fsStyle(scales?.[`info.${field}`], { fontSize: "var(--fs-caption)" }, `info.${field}`)}>
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-marino" {...fsStyle(scales?.[`info.${field}`], { fontSize: "var(--fs-caption)" }, `info.${field}`)}>{value}</p>
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
              <p className="font-mono uppercase tracking-[0.15em] text-gris-tx/50 mb-4" style={{ fontSize: "var(--fs-micro)" }}>
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
                    className="font-sans font-medium text-marino/60 hover:text-terracota border border-marino/15 hover:border-terracota/40 px-4 py-2 rounded-full transition-all"
                    style={{ fontSize: "var(--fs-caption)" }}
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
            <p className="font-mono uppercase tracking-[0.2em] text-terracota mb-2" {...fsStyle(scales?.["info.form_eyebrow"], { fontSize: "var(--fs-eyebrow)" }, "info.form_eyebrow")}>
              {info.form_eyebrow}
            </p>
            <p className="font-playfair font-bold text-marino mb-8" {...fsStyle(scales?.["info.form_title"], { fontSize: "var(--fs-lead)" }, "info.form_title")}>
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
            <motion.p variants={fadeUp} className="font-mono uppercase tracking-[0.22em] text-terracota mb-5" {...fsStyle(scales?.["faq.eyebrow"], { fontSize: "var(--fs-eyebrow)" }, "faq.eyebrow")}>
              {faq.eyebrow}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-playfair font-bold text-white text-[calc(2rem*var(--text-scale))] sm:text-[calc(2.5rem*var(--text-scale))] leading-[1.1]" {...fsStyle(scales?.["faq.title_pre"], undefined, "faq.title_pre")}>
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
                key={item.n}
                variants={revealCard}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-3"
              >
                <h3 className="font-playfair font-bold text-white leading-snug" {...fsStyle(scales?.[`faq.q${item.n}`], { fontSize: "var(--fs-body-lg)" }, `faq.q${item.n}`)}>
                  {item.q}
                </h3>
                <RichText
                  html={item.a}
                  className="rich-inline font-sans text-white/55 leading-relaxed"
                  style={{ fontSize: "var(--fs-caption)" }}
                  scale={scales?.[`faq.a${item.n}`]}
                  fkey={`faq.a${item.n}`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
