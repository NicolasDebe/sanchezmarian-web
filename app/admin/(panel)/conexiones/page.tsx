import { createAdminClient } from "@/lib/supabase"
import ConnectionsManager, {
  type ConnectionRow,
} from "@/components/admin/connections-manager"

export const dynamic = "force-dynamic"

export default async function ConexionesAdminPage() {
  let connections: ConnectionRow[] = []
  let loadError = false

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("connections")
      .select("id, label, is_active, position")
      .order("position", { ascending: true })

    if (error) {
      loadError = true
    } else {
      connections = (data ?? []) as ConnectionRow[]
    }
  } catch {
    loadError = true
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
        >
          Home
        </p>
        <h1
          className="mt-2 font-playfair font-bold"
          style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "var(--color-negro-bordo)" }}
        >
          Conexiones
        </h1>
        <p
          className="mt-3 font-sans text-sm leading-relaxed"
          style={{ color: "var(--color-gris-bordo)", maxWidth: 560 }}
        >
          Las alianzas/disciplinas que aparecen como pills en el home. Agregá,
          quitá, reordená con las flechas o ocultá sin borrar. Los cambios se
          reflejan en el sitio en ~1 minuto.
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
          <p className="font-semibold">La tabla de conexiones todavía no existe en Supabase.</p>
          <p className="mt-2" style={{ color: "var(--color-gris-bordo)" }}>
            Pegá el contenido de{" "}
            <code className="font-mono" style={{ fontSize: 12 }}>
              supabase/migrations/20260701_connections.sql
            </code>{" "}
            en el SQL Editor del dashboard de Supabase, después corré{" "}
            <code className="font-mono" style={{ fontSize: 12 }}>
              npx tsx scripts/seed-connections.ts
            </code>{" "}
            y recargá esta página. El sitio público sigue mostrando los valores por
            defecto mientras tanto.
          </p>
        </div>
      ) : (
        <ConnectionsManager connections={connections} />
      )}
    </div>
  )
}
