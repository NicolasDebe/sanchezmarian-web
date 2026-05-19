"use client"

import { useState } from "react"
import { ArrowRight, Send } from "lucide-react"

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? "YOUR_FORM_ID"

export function ContactForm() {
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

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-12">
        <div className="w-14 h-14 rounded-full bg-terracota/10 flex items-center justify-center">
          <Send size={22} className="text-terracota" strokeWidth={1.5} />
        </div>
        <h3 className="font-playfair font-bold text-marino text-2xl">¡Mensaje enviado!</h3>
        <p className="font-sans text-gris-tx text-sm leading-relaxed max-w-xs">
          Gracias por escribirme. Te respondo en menos de 24 horas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-nombre" className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-tx">
          Nombre
        </label>
        <input
          id="cf-nombre"
          type="text"
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          placeholder="Tu nombre"
          className="bg-white border border-marino/15 rounded-xl px-4 py-3 font-sans text-sm text-marino placeholder:text-gris-tx/40 focus:outline-none focus:border-terracota/60 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-email" className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-tx">
          Email
        </label>
        <input
          id="cf-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="tu@email.com"
          className="bg-white border border-marino/15 rounded-xl px-4 py-3 font-sans text-sm text-marino placeholder:text-gris-tx/40 focus:outline-none focus:border-terracota/60 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cf-mensaje" className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-tx">
          Mensaje
        </label>
        <textarea
          id="cf-mensaje"
          required
          rows={5}
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          placeholder="Contame en qué puedo ayudarte..."
          className="bg-white border border-marino/15 rounded-xl px-4 py-3 font-sans text-sm text-marino placeholder:text-gris-tx/40 focus:outline-none focus:border-terracota/60 transition-colors resize-none"
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
          Hubo un error al enviar. Intentá de nuevo o escribime a hola@sanchezmarian.com
        </p>
      )}

    </form>
  )
}
