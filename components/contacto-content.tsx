"use client"

import { motion } from "motion/react"
import { Mail, MapPin, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import {
  fadeUp, fadeLeft, fadeRight, revealCard,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"

const FAQ = [
  {
    q: "¿Cómo empezamos a trabajar juntos?",
    a: "Agendamos una sesión para conocernos, entender tu proyecto y ver cómo puedo ayudarte a comunicarlo.",
  },
  {
    q: "¿Con qué tipo de clientes trabajás?",
    a: "Trabajo con marcas, empresas, profesionales independientes y emprendedores de todo tamaño. Lo que importa es tener algo importante que contar.",
  },
  {
    q: "¿En cuánto tiempo ven resultados?",
    a: "Depende del servicio. En prensa, las primeras apariciones pueden darse en semanas. La construcción de autoridad a largo plazo lleva más tiempo, pero se nota.",
  },
  {
    q: "¿Trabajás solo con clientes de Mendoza?",
    a: "No. Tengo clientes en Buenos Aires, Córdoba y otras provincias. La comunicación estratégica no tiene fronteras geográficas.",
  },
]

const INFO_ITEMS = [
  { icon: Mail, label: "Email", value: "hola@sanchezmarian.com", href: "mailto:hola@sanchezmarian.com" },
  { icon: MapPin, label: "Ubicación", value: "Mendoza, Argentina", href: null },
  { icon: MessageCircle, label: "Disponibilidad", value: "Agendar sesión", href: null },
]

export function ContactoContent() {
  return (
    <>
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
              <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota">
                Datos de contacto
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-playfair font-bold text-marino text-[2rem] leading-[1.1]">
                Estoy disponible para<br />
                <em className="italic text-terracota">nuevos proyectos.</em>
              </motion.h2>
            </motion.div>

            <motion.div
              variants={fadeUpStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="flex flex-col gap-5"
            >
              {INFO_ITEMS.map(({ icon: Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-arena flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-terracota" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gris-tx/50 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="font-sans text-sm text-marino hover:text-terracota transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-sm text-marino">{value}</p>
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
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-tx/50 mb-4">
                También en redes
              </p>
              <div className="flex gap-3">
                {[
                  { label: "LinkedIn", href: "https://linkedin.com/in/sanchezmarian" },
                  { label: "Instagram", href: "https://instagram.com/sanchezmarian" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm font-medium text-marino/60 hover:text-terracota border border-marino/15 hover:border-terracota/40 px-4 py-2 rounded-full transition-all"
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
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota mb-2">
              Formulario de contacto
            </p>
            <p className="font-playfair font-bold text-marino text-xl mb-8">
              Contame en qué puedo ayudarte.
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
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
              Preguntas frecuentes
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-playfair font-bold text-white text-[2rem] sm:text-[2.5rem] leading-[1.1]">
              Antes de escribirme,<br />
              <em className="italic text-terracota">quizás acá está la respuesta.</em>
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
                key={item.q}
                variants={revealCard}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-3"
              >
                <h3 className="font-playfair font-bold text-white text-base leading-snug">
                  {item.q}
                </h3>
                <p className="font-sans text-white/55 text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
