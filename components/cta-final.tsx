"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import { Mail, MapPin } from "lucide-react"
import { PopoverForm, PopoverFormButton, PopoverFormSuccess } from "@/components/ui/popover-form"

const EASE = [0.22, 1, 0.36, 1] as const
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

export function CtaFinal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [open, setOpen] = useState(false)
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

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      {[
        { id: "pf-nombre", label: "Nombre", type: "text", field: "nombre" as const, placeholder: "Tu nombre" },
        { id: "pf-email", label: "Email", type: "email", field: "email" as const, placeholder: "tu@email.com" },
      ].map(({ id, label, type, field, placeholder }) => (
        <div key={id} className="flex flex-col gap-1">
          <label htmlFor={id} className="font-mono text-[9px] uppercase tracking-[0.18em] text-bordo/50">
            {label}
          </label>
          <input
            id={id}
            type={type}
            required
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder={placeholder}
            className="bg-hueso border border-bordo/12 rounded-lg px-3 py-2.5 font-sans text-sm text-negro-bordo placeholder:text-gris-bordo/30 focus:outline-none focus:border-bordo/35 transition-colors"
          />
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <label htmlFor="pf-mensaje" className="font-mono text-[9px] uppercase tracking-[0.18em] text-bordo/50">
          Mensaje
        </label>
        <textarea
          id="pf-mensaje"
          required
          rows={3}
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          placeholder="Contame en qué puedo ayudarte..."
          className="bg-hueso border border-bordo/12 rounded-lg px-3 py-2.5 font-sans text-sm text-negro-bordo placeholder:text-gris-bordo/30 focus:outline-none focus:border-bordo/35 transition-colors resize-none"
        />
      </div>
      <PopoverFormButton loading={submitting} text="Enviar consulta" />
      {error && (
        <p className="font-mono text-[9px] text-bordo-claro text-center">
          Error al enviar. Escribime a hola@sanchezmarian.com
        </p>
      )}
    </form>
  )

  return (
    <section id="contacto" ref={ref} className="bg-bordo py-24 lg:py-32">
      {/* Dorado top line */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="w-full h-px bg-dorado/25 mb-16" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

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
            Si buscás posicionar tu proyecto
            de forma orgánica y estratégica,
            me encantaría escucharte.
          </motion.p>

          {/* Datos */}
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

        {/* ── DERECHA — PopoverForm ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="flex flex-col items-center justify-center relative"
        >
          <p className="font-playfair italic text-hueso/50 text-lg mb-8 text-center">
            Conversemos.
          </p>

          <PopoverForm
            open={open}
            setOpen={setOpen}
            showSuccess={sent}
            title="Escribime →"
            width="min(380px, calc(100vw - 48px))"
            openChild={formContent}
            successChild={
              <PopoverFormSuccess
                title="¡Mensaje enviado!"
                description="Gracias por escribirme. Me comunico a la brevedad."
              />
            }
          />
        </motion.div>

      </div>
    </section>
  )
}
