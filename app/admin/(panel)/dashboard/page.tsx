import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

function greeting(email: string): string {
  if (email === "nicodebe05@gmail.com") return "Hola, Nico"
  if (email === "contacto@sanchezmarian.com") return "Hola, Marian"
  return "Hola"
}

export default async function DashboardPage() {
  let email = ""
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    email = user?.email ?? ""
  } catch {
    email = ""
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
      >
        Panel
      </p>
      <h1
        className="mt-2 font-playfair font-bold"
        style={{ fontSize: "2.25rem", color: "var(--color-negro-bordo)" }}
      >
        {greeting(email)}
      </h1>

      <p className="mt-3 font-sans text-sm leading-relaxed" style={{ color: "var(--color-gris-bordo)" }}>
        Elegí qué página editar. Podés cambiar los textos sin tocar código; los
        cambios se publican en el sitio en aproximadamente un minuto.
      </p>

      {/* Tarjetas por página editable */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EDITABLES.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border p-6 transition-colors hover:border-[var(--color-bordo)]"
            style={{
              backgroundColor: "var(--color-hueso-oscuro)",
              borderColor: "rgba(201,168,130,0.3)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="font-playfair text-lg font-bold"
                style={{ color: "var(--color-negro-bordo)" }}
              >
                {card.title}
              </h2>
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
                style={{ color: "var(--color-bordo)" }}
              >
                →
              </span>
            </div>
            <p className="mt-2 font-sans text-xs leading-relaxed" style={{ color: "var(--color-gris-bordo)" }}>
              {card.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

const EDITABLES = [
  { title: "Home", href: "/admin/edit/home", desc: "Hero, stats, método, bio y llamada final." },
  { title: "Servicios", href: "/admin/edit/servicios", desc: "Encabezado y los tres servicios con sus sub-servicios." },
  { title: "Mis valores", href: "/admin/edit/mis-valores", desc: "Hero, historia, pilares y cierre." },
  { title: "Casos de éxito", href: "/admin/edit/casos-de-exito", desc: "Encabezado y estadísticas." },
  { title: "Contacto", href: "/admin/edit/contacto", desc: "Hero, datos de contacto y preguntas frecuentes." },
  { title: "Menú y footer", href: "/admin/edit/global", desc: "Textos que aparecen en todas las páginas." },
  { title: "SEO", href: "/admin/edit/seo", desc: "Títulos y descripciones para Google de cada página." },
]
