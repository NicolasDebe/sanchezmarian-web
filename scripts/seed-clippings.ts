/**
 * Seed de clients + clippings de /casos-de-exito.
 * Ejecutar con: npx tsx scripts/seed-clippings.ts
 *
 * Requiere que las tablas existan (pegar supabase/migrations/
 * 20260610_clients_clippings.sql en el SQL Editor del dashboard).
 *
 * Idempotente:
 *  - clients: upsert por slug (no pisa logo/orden editados a mano si re-corre,
 *    sí los restaura a los valores del código — son la fuente actual).
 *  - clippings: inserta solo los que falten (match por client_id + url),
 *    así no duplica ni pisa fechas que Mariana haya corregido en el admin.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { CLIPPINGS } from "../data/clippings"
import { CLIENT_SEED, legacyPublishedAt } from "../lib/clippings"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const SCOPE_MAP: Record<string, string> = {
  Local: "local",
  Regional: "regional",
  Nacional: "nacional",
  Internacional: "internacional",
}

async function seed() {
  console.log("🌱 Seed de clients + clippings...\n")

  // ── 1. Clients (upsert por slug) ──
  const clientRows = CLIENT_SEED.map((c, idx) => ({
    slug: c.slug,
    name: c.name,
    logo_url: c.logo,
    order_position: idx,
    is_active: true,
  }))

  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .upsert(clientRows, { onConflict: "slug" })
    .select("id, slug")

  if (clientsError) {
    console.error("✗ Error al sembrar clients:", clientsError.message)
    if (clientsError.message.includes("Could not find the table")) {
      console.error(
        "\n→ Las tablas no existen todavía. Pegá el contenido de\n" +
          "  supabase/migrations/20260610_clients_clippings.sql\n" +
          "  en el SQL Editor del dashboard de Supabase y volvé a correr esto.",
      )
    }
    process.exit(1)
  }
  console.log(`✓ clients: ${clients?.length ?? 0} filas (upsert).`)

  const idBySlug = new Map(clients!.map((c) => [c.slug as string, c.id as string]))
  const idByKey = new Map(
    CLIENT_SEED.map((seed) => [seed.key, idBySlug.get(seed.slug)!]),
  )

  // ── 2. Clippings (insertar solo los que falten, match por client_id+url) ──
  const { data: existing, error: existingError } = await admin
    .from("clippings")
    .select("client_id, url")

  if (existingError) {
    console.error("✗ Error al leer clippings existentes:", existingError.message)
    process.exit(1)
  }
  const existingKeys = new Set(existing!.map((r) => `${r.client_id}::${r.url}`))

  // order_position por cliente preservando el orden del array original
  // (dentro de un mismo published_at, mayor order_position = más nuevo).
  const perClientIdx = new Map<string, number>()
  const rows = []
  for (const c of CLIPPINGS) {
    const clientId = idByKey.get(c.cliente)
    if (!clientId) {
      console.warn(`⚠ Cliente desconocido en data/clippings.ts: "${c.cliente}" (id ${c.id}) — salteado.`)
      continue
    }
    const idx = perClientIdx.get(clientId) ?? 0
    perClientIdx.set(clientId, idx + 1)
    if (existingKeys.has(`${clientId}::${c.link}`)) continue
    rows.push({
      client_id: clientId,
      medium: c.medio,
      title: c.titular,
      published_at: legacyPublishedAt(c.año, c.mes),
      scope: SCOPE_MAP[c.alcance] ?? "local",
      format: c.formato,
      url: c.link,
      order_position: idx,
      created_by: "seed",
    })
  }

  if (rows.length === 0) {
    console.log("✓ clippings: nada para insertar (ya estaban todos).")
  } else {
    const { error: insertError } = await admin.from("clippings").insert(rows)
    if (insertError) {
      console.error("✗ Error al insertar clippings:", insertError.message)
      process.exit(1)
    }
    console.log(`✓ clippings: ${rows.length} filas insertadas.`)
  }

  // ── 3. Verificación ──
  const { count: nClients } = await admin
    .from("clients")
    .select("*", { count: "exact", head: true })
  const { count: nClippings } = await admin
    .from("clippings")
    .select("*", { count: "exact", head: true })
  console.log(`\n📊 Totales: ${nClients} clients, ${nClippings} clippings.`)
}

seed()
