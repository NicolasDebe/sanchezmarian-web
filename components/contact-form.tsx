"use client"

import { useState } from "react"
import { motion } from "motion/react"
import toast from "react-hot-toast"
import { ArrowRight } from "lucide-react"
import { SITE_EMAIL, WHATSAPP_HREF } from "@/lib/constants"
import { springSnappy, tapScale } from "@/lib/animations"

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"
const WA_HREF = WHATSAPP_HREF

function IconWA() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2 22l5.41-1.36c1.35.74 2.9 1.16 4.63 1.16 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.08c-.23.65-1.35 1.25-1.85 1.32-.49.07-1.08.1-1.73-.11-.4-.13-.9-.3-1.55-.59-2.73-1.18-4.5-3.92-4.64-4.1-.13-.18-1.09-1.45-1.09-2.77 0-1.31.69-1.96.93-2.22.24-.26.53-.32.7-.32.18 0 .35.01.5.02.17.01.39-.06.61.47.23.55.77 1.88.84 2.02.07.14.12.3.02.48-.1.18-.15.29-.3.45-.14.16-.3.35-.42.47-.14.14-.29.29-.12.57.17.28.75 1.24 1.6 2.01 1.1 1 2.02 1.31 2.3 1.45.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.66-.16 1.3z" />
    </svg>
  )
}

const LABEL = "font-mono text-[var(--fs-micro)] uppercase tracking-[0.15em] text-gris-tx"
// text-base (16px) evita el zoom automático de iOS al enfocar inputs.
const INPUT_BASE = "bg-white border rounded-xl px-4 py-3 font-sans text-base text-marino placeholder:text-gris-tx/40 focus:outline-none transition-colors w-full"
const INPUT_OK = "border-marino/15 focus:border-terracota/60"
const INPUT_ERR = "border-bordo/60 focus:border-bordo/60"

function fieldValidate(name: string, value: string): string {
  if (name === "nombre") {
    if (!value.trim()) return "El nombre es requerido."
    if (value.trim().length < 2) return "Mínimo 2 caracteres."
  }
  if (name === "email") {
    if (!value.trim()) return "El email es requerido."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Ingresá un email válido."
  }
  if (name === "mensaje") {
    if (!value.trim()) return "El mensaje es requerido."
    if (value.trim().length < 10) return "Mínimo 10 caracteres."
  }
  return ""
}

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    empresa: "",
    etapa: "",
    mensaje: "",
  })
  const [errors, setErrors] = useState({ nombre: "", email: "", mensaje: "" })

  const handleBlur = (name: "nombre" | "email" | "mensaje") =>
    setErrors((prev) => ({ ...prev, [name]: fieldValidate(name, form[name]) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombreErr = fieldValidate("nombre", form.nombre)
    const emailErr = fieldValidate("email", form.email)
    const mensajeErr = fieldValidate("mensaje", form.mensaje)
    setErrors({ nombre: nombreErr, email: emailErr, mensaje: mensajeErr })
    if (nombreErr || emailErr || mensajeErr) return

    setSubmitting(true)
    setServerError(false)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          empresa: form.empresa || undefined,
          etapa: form.etapa || undefined,
          mensaje: form.mensaje,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        toast.success("¡Gracias! Te respondo pronto.")
      } else {
        setServerError(true)
        toast.error("No se pudo enviar. Probá de nuevo o escribime directo.")
      }
    } catch {
      setServerError(true)
      toast.error("No se pudo enviar. Probá de nuevo o escribime directo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center py-16"
      >
        <p className="font-playfair text-marino text-center" style={{ fontSize: "var(--fs-lead)" }}>
          ¡Gracias! Te respondo pronto.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate aria-busy={submitting}>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-nombre" className={LABEL}>Nombre</label>
        <input
          id="cf-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          onBlur={() => handleBlur("nombre")}
          placeholder="Tu nombre"
          className={`${INPUT_BASE} ${errors.nombre ? INPUT_ERR : INPUT_OK}`}
        />
        {errors.nombre && <p className="font-mono text-[10px] text-bordo">{errors.nombre}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-email" className={LABEL}>Email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onBlur={() => handleBlur("email")}
          placeholder="tu@email.com"
          className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
        />
        {errors.email && <p className="font-mono text-[10px] text-bordo">{errors.email}</p>}
      </div>

      {/* Empresa (opcional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-empresa" className={LABEL}>
          Empresa u organización{" "}
          <span className="normal-case tracking-normal opacity-50 font-sans text-[var(--fs-micro)]">(opcional)</span>
        </label>
        <input
          id="cf-empresa"
          name="empresa"
          type="text"
          autoComplete="organization"
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          placeholder="Nombre de tu empresa o proyecto"
          className={`${INPUT_BASE} ${INPUT_OK}`}
        />
      </div>

      {/* Etapa del proyecto */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-etapa" className={LABEL}>¿En qué etapa está tu proyecto?</label>
        <select
          id="cf-etapa"
          name="etapa"
          value={form.etapa}
          onChange={(e) => setForm({ ...form, etapa: e.target.value })}
          className={`${INPUT_BASE} ${INPUT_OK} cursor-pointer`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6070' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: "2.5rem",
            appearance: "none",
          }}
        >
          <option value="">Seleccioná una opción</option>
          <option value="idea">Tengo una idea</option>
          <option value="marcha">Estoy en marcha</option>
          <option value="reposicionamiento">Necesito reposicionarme</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Mensaje */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-mensaje" className={LABEL}>Mensaje</label>
        <textarea
          id="cf-mensaje"
          name="mensaje"
          rows={5}
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          onBlur={() => handleBlur("mensaje")}
          placeholder="Contame en qué puedo ayudarte..."
          className={`${INPUT_BASE} ${errors.mensaje ? INPUT_ERR : INPUT_OK} resize-none`}
        />
        {errors.mensaje && <p className="font-mono text-[10px] text-bordo">{errors.mensaje}</p>}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        whileTap={submitting ? undefined : { scale: tapScale }}
        transition={springSnappy}
        className="mt-1 inline-flex items-center justify-center gap-2 bg-terracota text-white px-6 py-3.5 rounded-full font-sans font-semibold hover:bg-terracota/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontSize: "var(--fs-caption)" }}
      >
        {submitting ? "Enviando…" : "Enviar consulta"}
        {!submitting && <ArrowRight size={15} strokeWidth={2.5} />}
      </motion.button>

      {/* WhatsApp — alternativa secundaria */}
      <div className="flex items-center justify-center gap-2">
        <span className="font-sans text-gris-tx/45" style={{ fontSize: "var(--fs-eyebrow)" }}>¿Preferís WhatsApp?</span>
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans font-medium text-gris-tx/60 hover:text-marino transition-colors"
          style={{ fontSize: "var(--fs-eyebrow)" }}
        >
          <IconWA />
          Escribime por acá
        </a>
      </div>

      {serverError && (
        <p className="font-mono text-[10px] text-bordo/80 text-center">
          Algo falló. Escribime a {SITE_EMAIL}
        </p>
      )}
    </form>
  )
}
