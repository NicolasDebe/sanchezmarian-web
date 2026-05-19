"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { Mail, MapPin, ArrowRight } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

export function CtaFinal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" })

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

  return (
    <section id="contacto" ref={ref} className="bg-bordo py-24 lg:py-32">
      {/* Dorado top line */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="w-full h-px bg-dorado/25 mb-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* ── IZQUIERDA — texto ── */}
        <div className="flex flex-col gap-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-dorado/60"
          >
            Hagamos que las cosas pasen.
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="font-playfair font-bold text-hueso text-[2.25rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.1]"
          >
            <span className="block">Creo en el valor de las buenas historias</span>
            <em className="block italic text-dorado">y en el poder de las conexiones reales.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="font-sans text-hueso/50 text-base leading-relaxed max-w-[400px]"
          >
            Si buscás posicionar tu proyecto de forma orgánica y estratégica,
            me encantaría escucharte.
          </motion.p>

          {/* Datos de contacto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: Mail, text: "hola@sanchezmarian.com" },
              { icon: MapPin, text: "Mendoza, Argentina" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={13} className="text-dorado/60 shrink-0" strokeWidth={1.5} />
                <span className="font-sans text-sm text-hueso/40">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── DERECHA — formulario inline ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          {sent ? (
            <div className="flex flex-col gap-4 py-12 text-center">
              <p className="font-playfair italic text-hueso/70 text-xl">¡Mensaje enviado!</p>
              <p className="font-sans text-hueso/50 text-sm leading-relaxed">
                Gracias por escribirme. Me comunico a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <p className="font-playfair italic text-hueso/50 text-lg mb-1">
                Conversemos.
              </p>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-nombre" className="font-mono text-[9px] uppercase tracking-[0.18em] text-hueso/40">
                  Nombre
                </label>
                <input
                  id="cf-nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  className="bg-transparent border border-hueso/15 rounded-lg px-4 py-3 font-sans text-sm text-hueso placeholder:text-hueso/25 focus:outline-none focus:border-hueso/40 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-email" className="font-mono text-[9px] uppercase tracking-[0.18em] text-hueso/40">
                  Email
                </label>
                <input
                  id="cf-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="bg-transparent border border-hueso/15 rounded-lg px-4 py-3 font-sans text-sm text-hueso placeholder:text-hueso/25 focus:outline-none focus:border-hueso/40 transition-colors"
                />
              </div>

              {/* Mensaje */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-mensaje" className="font-mono text-[9px] uppercase tracking-[0.18em] text-hueso/40">
                  Mensaje
                </label>
                <textarea
                  id="cf-mensaje"
                  required
                  rows={4}
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="Contame en qué puedo ayudarte..."
                  className="bg-transparent border border-hueso/15 rounded-lg px-4 py-3 font-sans text-sm text-hueso placeholder:text-hueso/25 focus:outline-none focus:border-hueso/40 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex items-center justify-center gap-2 bg-hueso text-bordo px-6 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-arena active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Enviando…" : "Escribime"}
                {!submitting && <ArrowRight size={14} strokeWidth={2} />}
              </button>

              {error && (
                <p className="font-mono text-[9px] text-dorado/70 text-center">
                  Error al enviar. Escribime a hola@sanchezmarian.com
                </p>
              )}
            </form>
          )}
        </motion.div>

      </div>
    </section>
  )
}
