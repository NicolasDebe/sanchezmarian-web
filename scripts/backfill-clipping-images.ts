/**
 * Backfill de imágenes de clippings desde Open Graph.
 *
 * Recorre los clippings que tienen `url` y todavía NO tienen `image_url`, lee la
 * imagen OG de cada enlace (mismo extractor que el auto-completar del admin) y la
 * guarda como image_url (enlace directo al medio, sin copia propia). Marian puede
 * reemplazar cualquiera después desde /admin.
 *
 * Idempotente: solo toca clippings sin imagen, así que se puede re-correr para
 * completar los que fallaron. Con --refresh reprocesa TODOS (pisa los OG viejos,
 * respeta imágenes propias del bucket).
 *
 * Ejecutar: npx tsx scripts/backfill-clipping-images.ts [--refresh]
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import { fetchUrlMetadata } from "../lib/extract-metadata"
import { isOwnImage } from "../lib/images"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const REFRESH = process.argv.includes("--refresh")
const CONCURRENCY = 5

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

interface Row {
  id: string
  medium: string
  url: string | null
  image_url: string | null
}

async function main() {
  const { data, error } = await admin
    .from("clippings")
    .select("id, medium, url, image_url")
    .not("url", "is", null)
  if (error) {
    console.error("Error leyendo clippings:", error.message)
    process.exit(1)
  }

  // A procesar: los que no tienen imagen. Con --refresh, también los que tienen
  // OG (image_url remota); nunca pisamos una imagen propia subida al bucket.
  const pending = (data as Row[]).filter((c) => {
    if (!c.url) return false
    if (!c.image_url) return true
    return REFRESH && !isOwnImage(c.image_url)
  })

  console.log(
    `${data!.length} clippings con URL · ${pending.length} a procesar${REFRESH ? " (--refresh)" : ""}\n`,
  )

  let ok = 0
  let noImg = 0
  let failed = 0

  // Pool de concurrencia simple.
  let idx = 0
  async function worker() {
    while (idx < pending.length) {
      const c = pending[idx++]
      try {
        const meta = await fetchUrlMetadata(c.url!)
        if (!meta.image) {
          noImg++
          console.log(`  ❌ sin OG image · ${c.medium}`)
          continue
        }
        const { error: upErr } = await admin
          .from("clippings")
          .update({ image_url: meta.image })
          .eq("id", c.id)
        if (upErr) {
          failed++
          console.log(`  ⚠ update falló · ${c.medium}: ${upErr.message}`)
        } else {
          ok++
        }
      } catch (e) {
        failed++
        console.log(`  ⚠ error · ${c.medium}: ${e instanceof Error ? e.message : e}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(
    `\n✅ Backfill listo · con imagen: ${ok} · sin OG image: ${noImg} · fallos: ${failed}`,
  )
}

main().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
