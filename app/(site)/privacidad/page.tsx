import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidad — Marian Sánchez",
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    title: "Información que recopilamos",
    body: "A través del formulario de contacto recopilamos tu nombre, dirección de email, y el mensaje que nos enviás. Esta información se usa exclusivamente para responderte y gestionar la relación de trabajo.",
  },
  {
    title: "Cómo usamos tu información",
    body: "Los datos que nos compartís se usan para responder tus consultas, enviarte información relevante sobre nuestros servicios (solo si lo solicitaste) y mejorar la experiencia del sitio. No vendemos ni compartimos tu información con terceros.",
  },
  {
    title: "Cookies",
    body: "Este sitio puede usar cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de seguimiento publicitario sin tu consentimiento.",
  },
  {
    title: "Tus derechos",
    body: "Tenés derecho a acceder, corregir o solicitar la eliminación de tus datos personales. Para ejercer estos derechos, escribinos a info@sanchezmarian.com.",
  },
  {
    title: "Contacto",
    body: "Ante cualquier consulta sobre esta política de privacidad, podés contactarnos en info@sanchezmarian.com.",
  },
]

export default function PrivacidadPage() {
  return (
    <>
      <section className="bg-arena pt-32 pb-16">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <p className="font-mono text-[length:var(--fs-micro)] uppercase tracking-[0.22em] text-terracota mb-4">
            Legal
          </p>
          <h1 className="font-playfair font-bold text-marino text-[calc(2.25rem*var(--text-scale))] sm:text-[calc(2.75rem*var(--text-scale))] leading-[1.1]">
            Política de Privacidad
          </h1>
          <p className="font-mono text-[length:var(--fs-micro)] text-gris-tx/50 mt-4">
            Última actualización: mayo 2026
          </p>
        </div>
      </section>

      <article className="bg-white py-16 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title} className="flex flex-col gap-3">
              <h2 className="font-playfair font-bold text-marino text-[length:var(--fs-lead)]">{s.title}</h2>
              <p className="font-sans text-[length:var(--fs-body-lg)] text-gris-tx leading-[1.7]">{s.body}</p>
            </div>
          ))}

          <div className="pt-4 border-t border-marino/10">
            <Link
              href="/"
              className="font-sans text-[length:var(--fs-caption)] font-medium text-terracota hover:text-marino transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
