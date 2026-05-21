import type { Metadata } from "next"
import { Mail, MapPin, MessageCircle } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contacto — Marian Sánchez",
  description:
    "Conversemos sobre tu estrategia de comunicación. Hablemos sobre cómo posicionar tu proyecto en los medios.",
  openGraph: {
    title: "Contacto — Marian Sánchez",
    description: "Conversemos sobre tu proyecto y cómo puedo ayudarte a comunicarlo.",
    url: "https://sanchezmarian.com/contacto",
  },
}

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

export default function ContactoPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Contacto"
        title="Hablemos sobre"
        titleAccent="tu historia."
        subtitle="Conversemos sobre tu proyecto y cómo puedo ayudarte a comunicarlo."
      />

      {/* Contacto principal */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-20 items-start">

          {/* Izquierda — info */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota">
                Datos de contacto
              </p>
              <h2 className="font-playfair font-bold text-marino text-[2rem] leading-[1.1]">
                Estoy disponible para<br />
                <em className="italic text-terracota">nuevos proyectos.</em>
              </h2>
            </div>

            {/* Info items */}
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "hola@sanchezmarian.com",
                  href: "mailto:hola@sanchezmarian.com",
                },
                {
                  icon: MapPin,
                  label: "Ubicación",
                  value: "Mendoza, Argentina",
                  href: null,
                },
                {
                  icon: MessageCircle,
                  label: "Disponibilidad",
                  value: "Agendar sesión",
                  href: null,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-arena flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-terracota" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gris-tx/50 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="font-sans text-sm text-marino hover:text-terracota transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-sm text-marino">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Redes */}
            <div className="pt-6 border-t border-marino/10">
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
            </div>
          </div>

          {/* Derecha — formulario */}
          <div className="bg-arena rounded-2xl p-8 lg:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracota mb-2">
              Formulario de contacto
            </p>
            <p className="font-playfair font-bold text-marino text-xl mb-8">
              Contame en qué puedo ayudarte.
            </p>
            <ContactForm />
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="bg-marina-osc bg-marino-osc py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
            Preguntas frecuentes
          </p>
          <h2 className="font-playfair font-bold text-white text-[2rem] sm:text-[2.5rem] leading-[1.1] mb-12">
            Antes de escribirme,<br />
            <em className="italic text-terracota">quizás acá está la respuesta.</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col gap-3"
              >
                <h3 className="font-playfair font-bold text-white text-base leading-snug">
                  {item.q}
                </h3>
                <p className="font-sans text-white/55 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
