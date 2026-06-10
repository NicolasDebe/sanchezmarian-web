import Link from "next/link"
import Image from "next/image"
import { createAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface ClientRow {
  id: string
  slug: string
  name: string
  logo_url: string | null
  clippings: { count: number }[]
}

export default async function ClippingsListPage() {
  let clients: ClientRow[] = []
  let loadError = false

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("clients")
      .select("id, slug, name, logo_url, clippings(count)")
      .eq("is_active", true)
      .order("order_position", { ascending: true })
    if (error) loadError = true
    else clients = (data ?? []) as ClientRow[]
  } catch {
    loadError = true
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
      >
        Casos de éxito
      </p>
      <h1
        className="mt-2 font-playfair font-bold"
        style={{ fontSize: "2.25rem", color: "var(--color-negro-bordo)" }}
      >
        Clippings
      </h1>
      <p
        className="mt-3 font-sans text-sm leading-relaxed"
        style={{ color: "var(--color-gris-bordo)" }}
      >
        Elegí un cliente para ver, agregar o editar sus apariciones en medios.
        Los cambios se publican en /casos-de-exito en aproximadamente un minuto.
      </p>

      {loadError ? (
        <div
          className="mt-8 rounded-2xl border p-6 font-sans text-sm leading-relaxed"
          style={{
            borderColor: "rgba(201,168,130,0.4)",
            backgroundColor: "rgba(201,168,130,0.1)",
            color: "var(--color-negro-bordo)",
          }}
        >
          <p className="font-semibold">Las tablas de clippings todavía no existen en Supabase.</p>
          <p className="mt-2" style={{ color: "var(--color-gris-bordo)" }}>
            Pegá el contenido de{" "}
            <code className="font-mono" style={{ fontSize: 12 }}>
              supabase/migrations/20260610_clients_clippings.sql
            </code>{" "}
            en el SQL Editor del dashboard de Supabase, después corré{" "}
            <code className="font-mono" style={{ fontSize: 12 }}>
              npx tsx scripts/seed-clippings.ts
            </code>{" "}
            y recargá esta página. El sitio público sigue funcionando normal mientras tanto.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => {
            const count = c.clippings?.[0]?.count ?? 0
            return (
              <Link
                key={c.id}
                href={`/admin/clippings/${c.slug}`}
                className="group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-bordo)] hover:shadow-sm"
                style={{
                  backgroundColor: "var(--color-hueso-oscuro)",
                  borderColor: "rgba(201,168,130,0.3)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex shrink-0 items-center justify-center rounded-lg"
                    style={{
                      width: 48,
                      height: 48,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {c.logo_url ? (
                      <Image
                        src={c.logo_url}
                        alt={`Logo ${c.name}`}
                        width={40}
                        height={40}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <span
                        className="font-mono font-bold"
                        style={{ color: "var(--color-bordo)", fontSize: 18 }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="truncate font-playfair font-bold"
                      style={{ fontSize: 15, color: "var(--color-negro-bordo)" }}
                    >
                      {c.name}
                    </h2>
                    <p
                      className="mt-0.5 font-mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        color: count === 0 ? "var(--color-dorado)" : "var(--color-gris-bordo)",
                      }}
                    >
                      {count === 0
                        ? "0 clippings — agregar el primero"
                        : `${count} clipping${count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
