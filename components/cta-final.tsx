"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useInView } from "motion/react"
import { Mail, MapPin, ArrowRight, Loader } from "lucide-react"

// TODO: reemplazar por número WA Business real
const WA_HREF = "https://wa.me/5492614000000?text=Hola%20Marian%2C%20me%20gustar%C3%ADa%20consultarte."

function IconWA() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2 22l5.41-1.36c1.35.74 2.9 1.16 4.63 1.16 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.08c-.23.65-1.35 1.25-1.85 1.32-.49.07-1.08.1-1.73-.11-.4-.13-.9-.3-1.55-.59-2.73-1.18-4.5-3.92-4.64-4.1-.13-.18-1.09-1.45-1.09-2.77 0-1.31.69-1.96.93-2.22.24-.26.53-.32.7-.32.18 0 .35.01.5.02.17.01.39-.06.61.47.23.55.77 1.88.84 2.02.07.14.12.3.02.48-.1.18-.15.29-.3.45-.14.16-.3.35-.42.47-.14.14-.29.29-.12.57.17.28.75 1.24 1.6 2.01 1.1 1 2.02 1.31 2.3 1.45.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.66-.16 1.3z" />
    </svg>
  )
}

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
  const router = useRouter()
  const isInView = useInView(ref, { once: true, margin: "-80px" })
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
      if (res.ok) router.push("/gracias")
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                  {/* WhatsApp — alternativa secundaria */}
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="font-sans text-xs text-hueso/35">¿Preferís WhatsApp?</span>
                    <a
                      href={WA_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-hueso/50 hover:text-hueso transition-colors"
                    >
                      <IconWA />
                      Escribime por acá
                    </a>
                  </div>

                  {error && (
                    <p className="font-mono text-[9px] text-dorado/70 text-center">
                      Error al enviar. Escribime a hola@sanchezmarian.com
                    </p>
                  )}
            </form>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
