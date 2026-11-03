/**
 * Recalcula los contadores del hero de /casos-de-exito y la meta description
 * con los números reales de la base.
 *
 *   npx tsx scripts/update-casos-stats.ts           → muestra los números (no escribe)
 *   npx tsx scripts/update-casos-stats.ts --apply   → los guarda en content_blocks
 *
 * - coberturas verificadas: total de clippings de clientes activos.
 * - medios distintos: dominios normalizados (sin www./amp./m., .com.ar = .com),
 *   sin contar plataformas (YouTube, Spotify, redes).
 * - formatos cubiertos: valores distintos de `format`.
 * - marcas activas: clientes activos con al menos un clipping.
 *
 * Igual que el editor de /admin: respalda el valor viejo en content_versions
 * (así "Deshacer último cambio" lo puede restaurar) y sube `version`.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PLATFORMS = /(^|\.)(youtube\.com|youtu\.be|spotify\.com|instagram\.com|facebook\.com|x\.com|twitter\.com|google\.com)$/

/** Espejos que publican la misma redacción con otro dominio. */
const MIRRORS: Record<string, string> = { "mendoza24": "entornoeconomico" }

function mediaKey(url: string): string | null {
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^(www|amp|m)\./, "")
    if (PLATFORMS.test(h)) return null
    const base = h.replace(/\.(com|net|org|gob|edu)?\.?(ar|cl|uy|va)$/, "").replace(/\.(com|net|org|info|news)$/, "")
    const name = base.split(".").at(-1)!
    return MIRRORS[name] ?? name
  } catch {
    return null
  }
}

async function main() {
  const { data: clients, error } = await admin.from("clients").select("id, is_active")
  if (error) throw error
  const active = new Set(clients!.filter((c) => c.is_active).map((c) => c.id as string))
  const { data: rows, error: e2 } = await admin.from("clippings").select("client_id, url, format")
  if (e2) throw e2
  const live = rows!.filter((r) => active.has(r.client_id))

  const total = live.length
  const media = new Set(live.map((r) => mediaKey(r.url)).filter(Boolean)).size
  const formats = new Set(live.map((r) => r.format)).size
  const brands = new Set(live.map((r) => r.client_id)).size

  const updates: [string, string, string, string][] = [
    ["casos_de_exito", "stats", "stat_1_number", String(total)],
    ["casos_de_exito", "stats", "stat_2_number", String(media)],
    ["casos_de_exito", "stats", "stat_3_number", String(formats)],
    ["casos_de_exito", "stats", "stat_4_number", String(brands)],
    [
      "seo",
      "casos_de_exito",
      "description",
      `${total} coberturas en ${media} medios locales, nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para marcas reales.`,
    ],
  ]

  for (const [page, section, field, value] of updates) {
    const { data: old } = await admin
      .from("content_blocks")
      .select("id, value, value_long, version")
      .eq("page", page)
      .eq("section", section)
      .eq("field", field)
      .maybeSingle()
    const before = old?.value_long ?? old?.value ?? "(vacío)"
    console.log(`${page}/${section}/${field}: ${before}  →  ${value}`)
    if (!APPLY || before === value) continue
    if (old) {
      await admin.from("content_versions").insert({
        content_block_id: old.id,
        value: old.value ?? old.value_long ?? "",
        value_long: old.value_long ?? null,
        version: old.version ?? 1,
        created_by: null,
      })
    }
    const { error: upErr } = await admin.from("content_blocks").upsert(
      {
        page,
        section,
        field,
        value,
        value_long: null,
        field_type: field === "description" ? "longtext" : "text",
        version: (old?.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page,section,field" },
    )
    if (upErr) console.log(`  ✗ ${upErr.message}`)
  }
  console.log(APPLY ? "\nGuardado." : "\n(solo vista previa; con --apply se guarda)")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
