/**
 * Seed del contenido editable de /servicios.
 * Ejecutar con: npx tsx scripts/seed-servicios.ts
 *
 * Inserta en content_blocks (page="servicios") TODOS los campos definidos en
 * lib/servicios-schema.ts, con upsert onConflict='page,section,field'
 * (idempotente). Los valores salen del esquema, que a su vez salió EXACTAMENTE
 * del contenido que ya vivía en el sitio. NO inventa nada: los campos sin fuente
 * (anchor_phrase, testimonial, testimonial_author) se insertan vacíos para que
 * Mariana los complete desde el admin.
 *
 * Pensado para correr DESPUÉS del rediseño: agrega los campos nuevos
 * (config.featured, cta.*, anchor_phrase, testimonial) sin pisar lo existente
 * con valores distintos (el upsert solo escribe el fallback; si Mariana ya
 * editó un campo, volvé a correr seed-content.ts con cuidado — este script es
 * para el primer alta de los campos nuevos).
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { SERVICIOS_SECTIONS } from "../lib/servicios-schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PAGE = "servicios"

async function seed() {
  console.log("🌱 Seed de /servicios...\n")

  // Qué campos ya existen, para NO pisar lo que Mariana pudo haber editado.
  const { data: existing, error: readErr } = await admin
    .from("content_blocks")
    .select("section, field")
    .eq("page", PAGE)

  if (readErr) {
    console.error("✗ No se pudo leer content_blocks:", readErr.message)
    process.exit(1)
  }
  const present = new Set((existing ?? []).map((r) => `${r.section}.${r.field}`))

  const rows = SERVICIOS_SECTIONS.flatMap((sec, sIdx) =>
    sec.fields
      .filter((f) => !present.has(`${sec.section}.${f.field}`))
      .map((f, fIdx) => ({
        page: PAGE,
        section: sec.section,
        field: f.field,
        value: f.fallback,
        value_long: null as string | null,
        field_type: f.type,
        position: sIdx * 100 + fIdx,
      })),
  )

  if (rows.length === 0) {
    console.log("✓ Todos los campos del esquema ya existen. Nada que insertar.")
  } else {
    const { data, error } = await admin
      .from("content_blocks")
      .upsert(rows, { onConflict: "page,section,field" })
      .select()

    if (error) {
      console.error("✗ Error en el upsert:", error.message)
      process.exit(1)
    }
    console.log(`✓ ${data?.length ?? rows.length} campos nuevos insertados:\n`)
    for (const r of rows) console.log(`  · ${r.section}.${r.field}`)
  }

  const totales = SERVICIOS_SECTIONS.reduce((acc, s) => acc + s.fields.length, 0)
  console.log(
    `\n📊 Esquema: ${SERVICIOS_SECTIONS.length} secciones · ${totales} campos.`,
  )
  console.log("✅ Seed de /servicios completado.")
}

seed().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
