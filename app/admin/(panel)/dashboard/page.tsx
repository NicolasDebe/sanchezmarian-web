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

      {/* Tarjeta de bienvenida */}
      <div
        className="mt-8 rounded-2xl border p-7"
        style={{ backgroundColor: "var(--color-hueso-oscuro)", borderColor: "rgba(201,168,130,0.3)" }}
      >
        <h2 className="font-playfair text-xl font-bold" style={{ color: "var(--color-negro-bordo)" }}>
          Editá el contenido de tu sitio
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed" style={{ color: "var(--color-gris-bordo)" }}>
          Desde acá podés cambiar los textos del home sin tocar código. Los
          cambios se publican en el sitio en aproximadamente un minuto.
        </p>
        <Link
          href="/admin/edit/home"
          className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
        >
          Editar contenido del home
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Tarjetas deshabilitadas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {["Histórico de cambios", "Campañas"].map((t) => (
          <div
            key={t}
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--color-hueso-oscuro)",
              borderColor: "rgba(201,168,130,0.22)",
              opacity: 0.65,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-lg font-bold" style={{ color: "var(--color-gris-bordo)" }}>
                {t}
              </h3>
              <span
                className="rounded-full px-2 py-0.5 font-mono"
                style={{
                  fontSize: 8,
                  letterSpacing: "0.08em",
                  backgroundColor: "rgba(201,168,130,0.18)",
                  color: "var(--color-dorado)",
                }}
              >
                PRÓXIMAMENTE
              </span>
            </div>
            <p className="mt-2 font-sans text-xs" style={{ color: "rgba(74,48,64,0.6)" }}>
              Disponible más adelante.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
