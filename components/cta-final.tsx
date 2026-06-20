"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import toast from "react-hot-toast"
import { Mail, MapPin, ArrowRight, Loader, MessageCircle, FileText } from "lucide-react"
import { fadeLeft, fadeUp, fadeUpStagger, revealCard, viewportOnce, springSnappy, tapScale } from "@/lib/animations"
import { fallbacksFor } from "@/lib/home-schema"
import { RichText } from "@/components/ui/RichText"
import { SITE_EMAIL, WHATSAPP_HREF } from "@/lib/constants"

const WA_HREF = WHATSAPP_HREF

// Accesos rápidos de contacto (bloque "Conversemos" sobre el formulario).
const EXPRESS_CARDS = [
  {
    Icon: MessageCircle,
    title: "Por WhatsApp",
    desc: "Respuesta rápida en horario laboral.",
    action: "Escribir ahora",
    arrow: "→",
    href: WHATSAPP_HREF,
    external: true,
  },
  {
    Icon: Mail,
    title: "Por email",
    desc: "Para consultas detalladas o envío de archivos.",
    action: "Enviar email",
    arrow: "→",
    href: `mailto:${SITE_EMAIL}`,
    external: false,
  },
  {
    Icon: FileText,
    title: "Por formulario",
    desc: "Contame sobre tu proyecto y te respondo en 24hs.",
    action: "Completar formulario",
    arrow: "↓",
    href: "#formulario",
    external: false,
  },
] as const

function IconWA() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2 22l5.41-1.36c1.35.74 2.9 1.16 4.63 1.16 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.08c-.23.65-1.35 1.25-1.85 1.32-.49.07-1.08.1-1.73-.11-.4-.13-.9-.3-1.55-.59-2.73-1.18-4.5-3.92-4.64-4.1-.13-.18-1.09-1.45-1.09-2.77 0-1.31.69-1.96.93-2.22.24-.26.53-.32.7-.32.18 0 .35.01.5.02.17.01.39-.06.61.47.23.55.77 1.88.84 2.02.07.14.12.3.02.48-.1.18-.15.29-.3.45-.14.16-.3.35-.42.47-.14.14-.29.29-.12.57.17.28.75 1.24 1.6 2.01 1.1 1 2.02 1.31 2.3 1.45.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.66-.16 1.3z" />
    </svg>
  )
}

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

// text-base (16px) evita el zoom automático de iOS al enfocar inputs.
const INPUT_CLASS =
  "w-full rounded-lg px-4 py-3 font-sans text-base text-hueso placeholder:text-hueso/30 focus:outline-none transition-colors"

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(254,252,239,0.15)",
}

const INPUT_FOCUS_STYLE = {
  borderColor: "rgba(254,252,239,0.5)",
}

export function CtaFinal({ content }: { content?: Record<string, string> }) {
  const c = { ...fallbacksFor("cta_final"), ...content }
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
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-hueso/60 mb-7"
          >
            Conversemos
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {EXPRESS_CARDS.map((card) => (
              <motion.a
                key={card.title}
                href={card.href}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                transition={springSnappy}
                {...(card.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-col gap-3 rounded-xl border border-dorado/30 bg-hueso p-6 transition-colors hover:border-bordo"
              >
                <card.Icon size={32} strokeWidth={1.5} className="text-bordo" />
                <h3 className="font-playfair text-[18px] text-negro-bordo">
                  {card.title}
                </h3>
                <p className="font-sans text-[13px] text-gris-bordo leading-relaxed">
                  {card.desc}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 font-sans text-[13px] font-medium text-bordo">
                  {card.action}
                  <span aria-hidden="true">{card.arrow}</span>
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
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.25em] text-hueso/60">
              {c.eyebrow}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              variants={fadeUp}
              className="font-playfair font-bold text-hueso text-[2.5rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.0]"
            >
              <span className="block">{c.title_pre}</span>
              <em className="block italic text-dorado">{c.title_accent}</em>
            </motion.h2>

            <motion.div variants={fadeUp} className="font-sans text-[0.9375rem] text-hueso/65 leading-[1.7] max-w-[420px]">
              <RichText html={c.description} className="rich-inline" />
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <Mail size={13} strokeWidth={1.5} className="text-hueso/50 shrink-0" />
                <span className="font-sans text-sm text-hueso/80">{c.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={13} strokeWidth={1.5} className="text-hueso/50 shrink-0" />
                <span className="font-sans text-sm text-hueso/60">{c.location}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── DERECHA — card formulario ── */}
        <motion.div
          id="formulario"
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
                <p className="font-playfair text-hueso text-xl text-center">
                  ¡Gracias! Te respondo pronto.
                </p>
              </motion.div>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={submitting}>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="cf-nombre"
                  className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
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
                  className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
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
                  className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
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
                className="mt-1 w-full flex items-center justify-center gap-2 bg-hueso text-bordo px-6 py-3.5 rounded-lg font-sans text-sm font-semibold hover:bg-arena transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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

              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-sans text-xs text-hueso/35">¿Preferís WhatsApp?</span>
                <a
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-hueso/50 hover:text-hueso transition-colors"
                >
                  <IconWA />
                  {c.whatsapp_text}
                </a>
              </div>

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
