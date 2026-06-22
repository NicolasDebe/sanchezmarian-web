/**
 * Actualiza las URLs de redes sociales en content_blocks a las versiones
 * canónicas aprobadas. Ejecutar con: npx tsx scripts/update-social-urls.ts
 *
 * - LinkedIn: https://www.linkedin.com/in/marians%C3%A1nchez/
 * - Instagram: https://www.instagram.com/marian15s/
 *
 * Actualiza TODA fila cuyo field contenga "linkedin" o "instagram" (no solo
 * las dos conocidas). Lista las filas afectadas y reporta valores viejos.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const LINKEDIN = "https://www.linkedin.com/in/marians%C3%A1nchez/"
const INSTAGRAM = "https://www.instagram.com/marian15s/"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function run() {
  console.log("🔗 Actualizando URLs sociales en content_blocks...\n")

  const { data: rows, error } = await admin
    .from("content_blocks")
    .select("id, page, section, field, value")
    .or("field.ilike.%linkedin%,field.ilike.%instagram%")

  if (error) {
    console.error("❌ Error leyendo content_blocks:", error.message)
    process.exit(1)
  }

  if (!rows || rows.length === 0) {
    console.log("⚠ No existen filas con field linkedin/instagram en content_blocks.")
    console.log("  El sitio usa los fallbacks de lib/constants.ts (ya correctos).")
    return
  }

  for (const r of rows) {
    const target = r.field.toLowerCase().includes("linkedin") ? LINKEDIN : INSTAGRAM
    const changed = r.value !== target
    if (changed) {
      const { error: upErr } = await admin
        .from("content_blocks")
        .update({ value: target })
        .eq("id", r.id)
      if (upErr) {
        console.error(`❌ ${r.page}/${r.section}/${r.field}: ${upErr.message}`)
        continue
      }
    }
    console.log(
      `${changed ? "✅ UPDATED" : "= sin cambios"}  ${r.page}/${r.section}/${r.field}`,
    )
    if (changed) console.log(`     viejo: ${r.value}\n     nuevo: ${target}`)
  }

  console.log(`\n📊 ${rows.length} fila(s) inspeccionada(s).`)
}

run()
