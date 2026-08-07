"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import toast from "react-hot-toast"
import { Mail, MapPin, ArrowRight, Loader, MessageCircle, FileText } from "lucide-react"
import { Instagram, Linkedin } from "@/components/ui/social-icons"
import { fadeLeft, fadeUp, fadeUpStagger, revealCard, viewportOnce, springSnappy, tapScale } from "@/lib/animations"
import { fallbacksFor } from "@/lib/home-schema"
import { RichText } from "@/components/ui/RichText"
import { fsStyle, type FieldScaleMap } from "@/lib/text-size"
import { SITE_EMAIL, SOCIAL_LINKS } from "@/lib/constants"

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

// text-base (16px) evita el zoom automático de iOS al enfocar inputs.
const INPUT_CLASS =
  "w-full rounded-lg px-4 py-3.5 font-sans text-base text-hueso placeholder:text-hueso/40 focus:outline-none transition-colors"

const INPUT_STYLE = {
  background: "rgba(254,252,239,0.06)",
  border: "1px solid rgba(254,252,239,0.18)",
}

const INPUT_FOCUS_STYLE = {
  borderColor: "rgba(254,252,239,1)",
  background: "rgba(254,252,239,0.08)",
  boxShadow: "0 0 0 3px rgba(254,252,239,0.1)",
}

export function CtaFinal({
  content,
  contact,
  social,
  scales,
}: {
  content?: Record<string, string>
  contact?: Record<string, string>
  social?: { instagram: string; linkedin: string }
  scales?: FieldScaleMap
}) {
  const c = { ...fallbacksFor("cta_final"), ...content }
  const ct = { ...fallbacksFor("contact"), ...contact }
  const instagramUrl = social?.instagram || SOCIAL_LINKS.instagram
  const linkedinUrl = social?.linkedin || SOCIAL_LINKS.linkedin

  // Accesos rápidos: solo canal + identificador + link (sin descripciones ni
  // tiempos de respuesta). Editables desde home.contact.
  // `key` es el prefijo de los campos editables de la card (contact.{key}_label
  // / _value): con él armamos los data-fkey de tamaño y fuente de cada texto.
  const cards = [
    {
      key: "whatsapp",
      Icon: MessageCircle,
      label: ct.whatsapp_label,
      value: ct.whatsapp_value,
      cta: ct.whatsapp_cta,
      href: ct.whatsapp_link,
      external: true,
    },
    {
      key: "email",
      Icon: Mail,
      label: ct.email_label,
      value: ct.email_value,
      cta: ct.email_cta,
      href: `mailto:${ct.email_value}`,
      external: false,
    },
    {
      key: "form",
      Icon: FileText,
      label: ct.form_label,
      value: ct.form_value,
      cta: ct.form_cta,
      href: "#form-contacto",
      external: false,
    },
  ]
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" })
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ nombre: form.nombre, email: form.email, mensaje: form.mensaje }),
      })
      if (res.ok) {
        setSuccess(true)
        toast.success("¡Gracias! Te respondo pronto.")
      } else {
        setError(true)
        toast.error("No se pudo enviar. Probá de nuevo o escribime directo.")
      }
    } catch {
      setError(true)
      toast.error("No se pudo enviar. Probá de nuevo o escribime directo.")
    } finally {
      setSubmitting(false)
    }
  }

  const fieldStyle = (name: string) => ({
    ...INPUT_STYLE,
    ...(focused === name ? INPUT_FOCUS_STYLE : {}),
  })

  return (
    <section
      id="contacto"
      className="relative py-24 lg:py-32"
      style={{
        background: "radial-gradient(ellipse at 25% 40%, rgba(140,26,53,0.35) 0%, transparent 65%), var(--color-bordo)",
      }}
    >
<div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── ACCESOS RÁPIDOS — 3 vías de contacto sobre el formulario ── */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16 lg:mb-20"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase tracking-[0.25em] text-hueso/60 mb-7"
            {...fsStyle(scales?.["contact.eyebrow"], { fontSize: "var(--fs-eyebrow)" }, "contact.eyebrow")}
          >
            {ct.eyebrow}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {cards.map((card) => (
              <motion.a
                key={card.key}
                href={card.href}
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(102,0,31,0.12)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                {...(card.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-[rgba(102,0,31,0.15)] bg-hueso p-8 transition-colors duration-[250ms] hover:border-[rgba(102,0,31,0.4)]"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <card.Icon size={32} strokeWidth={1.5} className="text-bordo" />
                <span
                  className="font-mono uppercase text-bordo/60"
                  {...fsStyle(scales?.[`contact.${card.key}_label`], { fontSize: "var(--fs-eyebrow)", letterSpacing: "0.12em" }, `contact.${card.key}_label`)}
                >
                  {card.label}
                </span>
                <span
                  className="font-playfair text-negro-bordo"
                  {...fsStyle(scales?.[`contact.${card.key}_value`], { fontSize: "var(--fs-lead)" }, `contact.${card.key}_value`)}
                >
                  {card.value}
                </span>
                <span
                  className="mt-1 inline-flex items-center gap-1 font-sans font-semibold text-bordo"
                  {...fsStyle(scales?.[`contact.${card.key}_cta`], { fontSize: "var(--fs-eyebrow)" }, `contact.${card.key}_cta`)}
                >
                  {card.cta}
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start relative">

        {/* ── IZQUIERDA — texto ── */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-7"
        >
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-7"
          >
            <motion.p variants={fadeUp} className="font-mono uppercase tracking-[0.25em] text-hueso/60" {...fsStyle(scales?.["cta_final.eyebrow"], { fontSize: "var(--fs-eyebrow)" }, "cta_final.eyebrow")}>
              {c.eyebrow}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              variants={fadeUp}
              className="font-playfair font-bold text-hueso text-[calc(2.5rem*var(--text-scale))] sm:text-[calc(3rem*var(--text-scale))] lg:text-[calc(3.25rem*var(--text-scale))] leading-[1.0]"
              {...fsStyle(scales?.["cta_final.title_pre"], undefined, "cta_final.title_pre")}
            >
              <span className="block">{c.title_pre}</span>
              <em className="block italic text-dorado">{c.title_accent}</em>
            </motion.h2>

            <motion.div variants={fadeUp} className="font-sans text-hueso/65 leading-[1.7] max-w-[420px]" style={{ fontSize: "var(--fs-body)" }}>
              {/* fontSize propio: los <p> del HTML sanitizado no lo traen y
                  heredarían un valor ya resuelto (ver nota en bio.tsx). */}
              <RichText html={c.description} className="rich-inline" style={{ fontSize: "var(--fs-body)" }} scale={scales?.["cta_final.description"]} fkey="cta_final.description" />
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-dorado shrink-0" />
                <span className="font-sans text-hueso/90" {...fsStyle(scales?.["cta_final.email"], { fontSize: "var(--fs-caption)" }, "cta_final.email")}>{c.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} strokeWidth={1.5} className="text-dorado shrink-0" />
                <span className="font-sans text-hueso/75" {...fsStyle(scales?.["cta_final.location"], { fontSize: "var(--fs-caption)" }, "cta_final.location")}>{c.location}</span>
              </div>
            </motion.div>

            {/* También en redes — presencia social con la identidad del CTA. */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3">
              <p className="font-mono uppercase tracking-[0.18em] text-hueso/50" style={{ fontSize: "var(--fs-eyebrow)" }}>
                También en redes
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Marian Sánchez"
                  className="group inline-flex min-h-11 w-fit items-center gap-2.5"
                >
                  <Instagram size={16} strokeWidth={1.5} className="shrink-0 text-hueso/75 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="relative font-sans text-hueso/85 transition-colors duration-200 group-hover:text-hueso" style={{ fontSize: "var(--fs-caption)" }}>
                    @marian15s
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-hueso/70 transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <span aria-hidden="true" className="font-sans text-hueso/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-hueso">
                    →
                  </span>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn de Marian Sánchez"
                  className="group inline-flex min-h-11 w-fit items-center gap-2.5"
                >
                  <Linkedin size={16} strokeWidth={1.5} className="shrink-0 text-hueso/75 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="relative font-sans text-hueso/85 transition-colors duration-200 group-hover:text-hueso" style={{ fontSize: "var(--fs-caption)" }}>
                    Marian Sánchez
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-hueso/70 transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <span aria-hidden="true" className="font-sans text-hueso/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-hueso">
                    →
                  </span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── DERECHA — card formulario ── */}
        <motion.div
          id="form-contacto"
          className="scroll-mt-24"
          variants={revealCard}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div
            className="rounded-[20px] p-6 sm:p-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(254,252,239,0.12)",
            }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center min-h-[260px]"
              >
                <p className="font-playfair text-hueso text-center" style={{ fontSize: "var(--fs-lead)" }}>
                  ¡Gracias! Te respondo pronto.
                </p>
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={submitting}>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cf-nombre"
                  className="font-mono uppercase tracking-[0.18em] text-hueso/85"
                  style={{ fontSize: "var(--fs-eyebrow)" }}
                >
                  Nombre
                </label>
                <input
                  id="cf-nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  onFocus={() => setFocused("nombre")}
                  onBlur={() => setFocused(null)}
                  placeholder="Tu nombre"
                  className={INPUT_CLASS}
                  style={fieldStyle("nombre")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cf-email"
                  className="font-mono uppercase tracking-[0.18em] text-hueso/85"
                  style={{ fontSize: "var(--fs-eyebrow)" }}
                >
                  Email
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="tu@email.com"
                  className={INPUT_CLASS}
                  style={fieldStyle("email")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cf-mensaje"
                  className="font-mono uppercase tracking-[0.18em] text-hueso/85"
                  style={{ fontSize: "var(--fs-eyebrow)" }}
                >
                  Mensaje
                </label>
                <textarea
                  id="cf-mensaje"
                  name="mensaje"
                  required
                  rows={4}
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  onFocus={() => setFocused("mensaje")}
                  onBlur={() => setFocused(null)}
                  placeholder="Contame en qué puedo ayudarte..."
                  className={`${INPUT_CLASS} resize-none`}
                  style={fieldStyle("mensaje")}
                />
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                whileTap={submitting ? undefined : { scale: tapScale }}
                transition={springSnappy}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-hueso text-bordo px-6 py-4 rounded-lg font-sans font-semibold hover:bg-arena transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                {...fsStyle(scales?.["cta_final.form_button"], { fontSize: "var(--fs-caption)" }, "cta_final.form_button")}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {submitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ type: "spring", duration: 0.25, bounce: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader size={13} className="animate-spin" />
                      Enviando…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ type: "spring", duration: 0.25, bounce: 0 }}
                      className="flex items-center gap-2"
                    >
                      {c.form_button}
                      <ArrowRight size={14} strokeWidth={2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {error && (
                <p className="font-mono text-[9px] text-dorado/70 text-center">
                  Algo falló. Escribime a {SITE_EMAIL}
                </p>
              )}
            </form>
            )}
          </div>
        </motion.div>

        </div>
      </div>
    </section>
  )
}
