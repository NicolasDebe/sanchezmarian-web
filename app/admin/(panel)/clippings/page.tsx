import { createAdminClient } from "@/lib/supabase"
import SortableClientsList, {
  type SortableClient,
} from "@/components/admin/SortableClientsList"

export const dynamic = "force-dynamic"

interface ClientRow {
  id: string
  slug: string
  name: string
  logo_url: string | null
  clippings: { count: number }[]
}

export default async function ClippingsListPage() {
  let clients: SortableClient[] = []
  let loadError = false

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("clients")
      .select("id, slug, name, logo_url, clippings(count)")
      .eq("is_active", true)
      // Mismo orden que /casos-de-exito: order_position ASC, NULLS al final,
      // name ASC como desempate.
      .order("order_position", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })

    if (error) {
      loadError = true
    } else {
      clients = ((data ?? []) as ClientRow[]).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        logo_url: c.logo_url,
        clippings_count: c.clippings?.[0]?.count ?? 0,
      }))
    }
  } catch {
    loadError = true
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
        >
          Casos de éxito
        </p>
        <h1
          className="mt-2 font-playfair font-bold"
          style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "var(--color-negro-bordo)" }}
        >
          Clippings
        </h1>
        <p
          className="mt-3 font-sans text-sm leading-relaxed"
          style={{ color: "var(--color-gris-bordo)", maxWidth: 620 }}
        >
          Elegí un cliente para ver, agregar o editar sus apariciones en medios.
          Arrastrá desde el ícono <span aria-hidden>≡</span> para reordenar — el
          orden se refleja en /casos-de-exito.
        </p>
      </div>

      {loadError ? (
        <div
          className="rounded-2xl border p-6 font-sans text-sm leading-relaxed"
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
        <SortableClientsList clients={clients} />
      )}
    </div>
  )
}
