/**
 * Seed inicial del contenido editable del HOME.
 * Ejecutar con: npx tsx scripts/seed-content.ts
 *
 * Inserta todos los campos definidos en lib/home-schema.ts (~43 filas) a
 * content_blocks, usando upsert con onConflict='page,section,field' (idempotente).
 * Los valores salen del esquema (que a su vez salió del código actual). No inventa.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { HOME_SECTIONS } from "../lib/home-schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PAGE = "home"

async function seed() {
  console.log("🌱 Seed de contenido del home...\n")

  const rows = HOME_SECTIONS.flatMap((sec, sIdx) =>
    sec.fields.map((f, fIdx) => ({
      page: PAGE,
      section: sec.section,
      field: f.field,
      value: f.fallback,
      value_long: null as string | null,
      field_type: f.type,
      position: sIdx * 100 + fIdx,
    })),
  )

  const { data, error } = await admin
    .from("content_blocks")
    .upsert(rows, { onConflict: "page,section,field" })
    .select()

  if (error) {
    console.error("✗ Error en el upsert:", error.message)
    process.exit(1)
  }

  console.log(`✓ ${data?.length ?? 0} filas insertadas/actualizadas.`)

  // Resumen por sección
  for (const sec of HOME_SECTIONS) {
    console.log(`  · ${sec.section.padEnd(12)} ${sec.fields.length} campos`)
  }

  const { count } = await admin
    .from("content_blocks")
    .select("*", { count: "exact", head: true })
    .eq("page", PAGE)

  console.log(`\n📊 Total de filas con page='${PAGE}' en content_blocks: ${count}`)
  console.log("✅ Seed completado.")
}

seed().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
