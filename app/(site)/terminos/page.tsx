import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos y Condiciones — Marian Sánchez",
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    title: "Uso del sitio",
    body: "Al acceder y usar este sitio web aceptás las presentes condiciones de uso. El sitio es de carácter informativo y está destinado a presentar los servicios de comunicación estratégica ofrecidos por Mariana Sánchez / GB Consulting.",
  },
  {
    title: "Propiedad intelectual",
    body: "Todo el contenido de este sitio — textos, imágenes, diseño y código — es propiedad de Mariana Sánchez, salvo que se indique lo contrario. Queda prohibida su reproducción total o parcial sin autorización expresa.",
  },
  {
    title: "Limitación de responsabilidad",
    body: "La información de este sitio se provee con fines orientativos. No garantizamos que el contenido esté libre de errores o que el sitio esté disponible de forma ininterrumpida. No somos responsables por daños derivados del uso del sitio.",
  },
  {
    title: "Links externos",
    body: "Este sitio puede contener enlaces a sitios de terceros. No somos responsables por el contenido ni las prácticas de privacidad de esos sitios.",
  },
  {
    title: "Contacto",
    body: "Para cualquier consulta sobre estos términos, escribinos a info@sanchezmarian.com.",
  },
]

export default function TerminosPage() {
  return (
    <>
      <section className="bg-arena pt-32 pb-16">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <p className="font-mono text-[length:var(--fs-micro)] uppercase tracking-[0.22em] text-terracota mb-4">
            Legal
          </p>
          <h1 className="font-playfair font-bold text-marino text-[calc(2.25rem*var(--text-scale))] sm:text-[calc(2.75rem*var(--text-scale))] leading-[1.1]">
            Términos y Condiciones
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
