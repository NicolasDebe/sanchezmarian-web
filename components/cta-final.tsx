"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { Mail, MapPin, ArrowRight, Loader } from "lucide-react"

/*
 * Cult-UI review:
 * - PopoverForm: widget flotante activado por botón, colores hardcodeados
 *   (bg-muted, dark:bg-[#121212], botón con gradiente azul) — no aplica.
 * Patrón extraído: AnimatePresence mode="popLayout" con blur+y para idle→success.
 */

const EASE = [0.22, 1, 0.36, 1] as const
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

const INPUT_CLASS =
  "w-full rounded-lg px-4 py-3 font-sans text-sm text-hueso placeholder:text-hueso/30 focus:outline-none transition-colors"

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(254,252,239,0.15)",
}

const INPUT_FOCUS_STYLE = {
  borderColor: "rgba(254,252,239,0.5)",
}

export function CtaFinal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
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
      if (res.ok) setSent(true)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldStyle = (name: string) => ({
    ...INPUT_STYLE,
    ...(focused === name ? INPUT_FOCUS_STYLE : {}),
  })

  return (
    <section id="contacto" ref={ref} className="bg-bordo py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* ── IZQUIERDA — texto ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          className="flex flex-col gap-7"
        >
          {/* Eyebrow */}
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-hueso/60">
            Hagamos que las cosas pasen.
          </p>

          {/* Línea dorada */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.55, ease: EASE, delay: 0.28 }}
            className="w-10 h-px bg-dorado"
          />

          {/* Título */}
          <h2 className="font-playfair font-bold text-hueso text-[2.5rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.0]">
            <span className="block">Creo en el valor de las buenas historias</span>
            <em className="block italic text-dorado">y en el poder de las conexiones reales.</em>
          </h2>

          {/* Subtítulo */}
          <p className="font-sans italic text-[0.9375rem] text-hueso/65">
            Conversemos.
          </p>

          {/* Descripción */}
          <p className="font-sans text-[0.9375rem] text-hueso/65 leading-[1.7] max-w-[420px]">
            Si buscás posicionar tu proyecto de forma orgánica y estratégica,
            me encantaría escucharte.
          </p>

          {/* Datos de contacto */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-3">
              <Mail size={13} strokeWidth={1.5} className="text-hueso/50 shrink-0" />
              <span className="font-sans text-sm text-hueso/80">hola@sanchezmarian.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={13} strokeWidth={1.5} className="text-hueso/50 shrink-0" />
              <span className="font-sans text-sm text-hueso/60">Mendoza, Argentina</span>
            </div>
          </div>
        </motion.div>

        {/* ── DERECHA — card formulario ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.25, ease: EASE }}
        >
          <div
            className="rounded-[20px] p-10"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(254,252,239,0.12)",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {sent ? (
                /* ── Estado success ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="flex flex-col items-center justify-center gap-5 py-14 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ border: "1px solid rgba(201,168,130,0.35)" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="text-dorado"
                    >
                      <path
                        d="M4 10.5L8 14.5L16 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="font-playfair italic text-hueso text-2xl">¡Gracias!</p>
                  <p className="font-sans text-hueso/60 text-sm leading-relaxed max-w-[240px]">
                    Tu mensaje llegó. Pronto nos ponemos en contacto.
                  </p>
                </motion.div>
              ) : (
                /* ── Estado idle / loading ── */
                <motion.form
                  key="form"
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  {/* Nombre */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="cf-nombre"
                      className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
                    >
                      Nombre
                    </label>
                    <input
                      id="cf-nombre"
                      type="text"
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

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="cf-email"
                      className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
                    >
                      Email
                    </label>
                    <input
                      id="cf-email"
                      type="email"
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

                  {/* Mensaje */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="cf-mensaje"
                      className="font-sans text-[11px] uppercase tracking-[0.16em] text-hueso/50"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="cf-mensaje"
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

                  {/* Botón submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full flex items-center justify-center gap-2 bg-hueso text-bordo px-6 py-3.5 rounded-lg font-sans text-sm font-semibold hover:bg-arena active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
                          Escribime
                          <ArrowRight size={14} strokeWidth={2} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {error && (
                    <p className="font-mono text-[9px] text-dorado/70 text-center">
                      Error al enviar. Escribime a hola@sanchezmarian.com
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
