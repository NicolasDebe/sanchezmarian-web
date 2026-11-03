/**
 * Pone published_at = 2026-10-13 a todos los clippings cargados en la
 * actualización de octubre 2026 (created_at desde el 13/10), para que
 * aparezcan primero en /casos-de-exito (orden: published_at DESC).
 *
 *   npx tsx scripts/set-date-new-clippings-oct2026.ts           → muestra cuántos (no escribe)
 *   npx tsx scripts/set-date-new-clippings-oct2026.ts --apply   → aplica
 *
 * Antes de escribir guarda las fechas originales en
 * clippings-oct2026/backup-fechas-originales.json.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")
const NEW_DATE = "2026-10-13"
const LOADED_FROM = "2026-10-13T00:00:00-03:00"
const BACKUP = path.resolve(process.cwd(), "clippings-oct2026/backup-fechas-originales.json")

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  const { data: clients } = await admin.from("clients").select("id, slug")
  const { data: rows, error } = await admin
    .from("clippings")
    .select("id, client_id, published_at")
    .gte("created_at", new Date(LOADED_FROM).toISOString())
  if (error) throw error

  const bySlug: Record<string, number> = {}
  for (const r of rows!) {
    const slug = clients!.find((c) => c.id === r.client_id)?.slug ?? r.client_id
    bySlug[slug] = (bySlug[slug] ?? 0) + 1
  }
  console.log(`Clippings nuevos: ${rows!.length}`, bySlug)

  if (!APPLY) return console.log("\n(solo vista previa; con --apply se cambian las fechas)")

  if (!fs.existsSync(BACKUP)) {
    fs.writeFileSync(BACKUP, JSON.stringify(rows!.map(({ id, published_at }) => ({ id, published_at })), null, 2))
  }
  const { data, error: upErr } = await admin
    .from("clippings")
    .update({ published_at: NEW_DATE })
    .in("id", rows!.map((r) => r.id))
    .select("id")
  if (upErr) throw upErr
  console.log(`\nFecha ${NEW_DATE} aplicada a ${data!.length} clippings.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
