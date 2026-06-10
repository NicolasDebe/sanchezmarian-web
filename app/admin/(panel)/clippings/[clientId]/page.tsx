import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import type { DbClipping } from "@/lib/clippings"
import { ClippingsManager } from "./clippings-manager"

export const dynamic = "force-dynamic"

export default async function ClientClippingsPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params

  let client: { id: string; slug: string; name: string; logo_url: string | null } | null = null
  let clippings: DbClipping[] = []
  let mediums: string[] = []

  try {
    const admin = createAdminClient()
    const { data: clientRow } = await admin
      .from("clients")
      .select("id, slug, name, logo_url")
      .eq("slug", clientId)
      .maybeSingle()

    if (!clientRow) notFound()
    client = clientRow

    const [clippingsRes, mediumsRes] = await Promise.all([
      admin
        .from("clippings")
        .select("id, client_id, medium, title, published_at, scope, format, url, order_position")
        .eq("client_id", clientRow.id)
        .order("published_at", { ascending: false })
        .order("order_position", { ascending: false }),
      admin.from("clippings").select("medium"),
    ])

    clippings = (clippingsRes.data ?? []) as DbClipping[]
    mediums = Array.from(
      new Set((mediumsRes.data ?? []).map((r) => r.medium as string)),
    ).sort((a, b) => a.localeCompare(b, "es"))
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/clippings"
        className="font-sans text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--color-gris-bordo)" }}
      >
        ← Volver a clientes
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: 72,
            height: 72,
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {client!.logo_url ? (
            <Image
              src={client!.logo_url}
              alt={`Logo ${client!.name}`}
              width={60}
              height={60}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <span
              className="font-mono font-bold"
              style={{ color: "var(--color-bordo)", fontSize: 26 }}
            >
              {client!.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
          >
            Clippings
          </p>
          <h1
            className="mt-1 font-playfair font-bold"
            style={{ fontSize: "1.75rem", color: "var(--color-negro-bordo)" }}
          >
            {client!.name}
          </h1>
        </div>
      </div>

      <ClippingsManager
        clientId={client!.id}
        clippings={clippings}
        mediums={mediums}
      />
    </div>
  )
}
