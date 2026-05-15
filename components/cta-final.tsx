"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { ArrowRight, Mail, MapPin, Send } from "lucide-react"

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
      if (res.ok) {
        setSent(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contacto" ref={ref} className="bg-marino py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* ── IZQUIERDA — texto ── */}
        <div className="flex flex-col gap-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota"
          >
            Hablemos
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="font-playfair font-bold text-white text-[2.25rem] sm:text-[3rem] lg:text-[3.25rem] leading-[1.1]"
          >
            <span className="block">Tu historia merece</span>
            <em className="block italic text-terracota">ser escuchada.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="font-sans text-white/60 text-base leading-relaxed max-w-[420px]"
          >
            Completá el formulario y te respondo en menos de 24 horas.
            La primera consulta es gratuita y sin compromiso.
          </motion.p>

          {/* Datos de contacto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="flex flex-col gap-3 mt-2"
          >
            {[
              { icon: Mail, text: "hola@sanchezmarian.com" },
              { icon: MapPin, text: "Mendoza, Argentina" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={14} className="text-terracota shrink-0" strokeWidth={1.5} />
                <span className="font-sans text-sm text-white/50">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── DERECHA — formulario ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          {sent ? (
            <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-10 flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-terracota/15 flex items-center justify-center">
                <Send size={22} className="text-terracota" strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair font-bold text-white text-2xl">¡Mensaje enviado!</h3>
              <p className="font-sans text-white/55 text-sm leading-relaxed max-w-xs">
                Gracias por escribirme. Te respondo en menos de 24 horas.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 rounded-[1.5rem] p-8 flex flex-col gap-5"
            >
              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nombre" className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-terracota/60 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-terracota/60 transition-colors"
                />
              </div>

              {/* Mensaje */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mensaje" className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  required
                  rows={4}
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  placeholder="Contame en qué puedo ayudarte..."
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-terracota/60 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex items-center justify-center gap-2 bg-terracota text-white px-6 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Enviando…" : "Enviar consulta"}
                {!submitting && <ArrowRight size={15} strokeWidth={2.5} />}
              </button>

              {error && (
                <p className="font-mono text-[10px] text-terracota/80 text-center">
                  Hubo un error al enviar. Intentá de nuevo o escribime directo a hola@sanchezmarian.com
                </p>
              )}

              <p className="font-mono text-[10px] text-white/25 text-center leading-relaxed">
                Primera consulta gratuita · Sin compromiso · Respuesta en 24 hs
              </p>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  )
}
