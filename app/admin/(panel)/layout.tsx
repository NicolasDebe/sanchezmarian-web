import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/admin/actions"

export const dynamic = "force-dynamic"

const SECTIONS = [
  { label: "Home", href: "/admin/edit/home", enabled: true },
  { label: "Servicios", href: "/admin/edit/servicios", enabled: true },
  { label: "Mis valores", href: "/admin/edit/mis-valores", enabled: true },
  { label: "Casos de éxito", href: "/admin/edit/casos-de-exito", enabled: true },
  { label: "Contacto", href: "/admin/edit/contacto", enabled: true },
  { label: "Menú y footer", href: "/admin/edit/global", enabled: true },
  { label: "SEO", href: "/admin/edit/seo", enabled: true },
]

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-hueso)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 flex w-60 flex-col border-r"
        style={{
          backgroundColor: "var(--color-hueso-oscuro)",
          borderColor: "rgba(201,168,130,0.25)",
        }}
      >
        {/* Logo + email */}
        <div className="px-6 pt-7 pb-6">
          <Link
            href="/admin/dashboard"
            className="font-playfair text-2xl font-bold"
            style={{ color: "var(--color-bordo)" }}
          >
            Marian<span style={{ color: "var(--color-dorado)" }}>.</span>
          </Link>
          {email && (
            <p
              className="mt-2 truncate font-mono"
              style={{ fontSize: 11, color: "var(--color-gris-bordo)" }}
            >
              {email}
            </p>
          )}
        </div>

        {/* Links */}
        <nav className="flex-1 px-3">
          <p
            className="px-3 pb-2 font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(74,48,64,0.55)" }}
          >
            Secciones
          </p>
          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((s) =>
              s.enabled ? (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.06)]"
                    style={{ color: "var(--color-negro-bordo)" }}
                  >
                    {s.label}
                  </Link>
                </li>
              ) : (
                <li key={s.label}>
                  <span
                    className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 font-sans text-sm"
                    style={{ color: "rgba(74,48,64,0.4)" }}
                  >
                    {s.label}
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
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t px-3 py-4" style={{ borderColor: "rgba(201,168,130,0.25)" }}>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.06)]"
              style={{ color: "var(--color-gris-bordo)" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-60 flex-1 px-8 py-10 lg:px-12">{children}</main>
    </div>
  )
}
