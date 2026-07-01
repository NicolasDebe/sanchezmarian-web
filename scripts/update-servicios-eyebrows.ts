/**
 * Reconcilia los eyebrows de /servicios con los textos oficiales:
 * quita la numeración ("01 · ", "02 · "…) y deja solo el label del servicio
 * principal. Los servicios 02/03/04 no llevan eyebrow (jerarquía por diseño).
 *
 * Ejecutar con: npx tsx scripts/update-servicios-eyebrows.ts
 *
 * Idempotente: solo toca page="servicios", field="eyebrow" de las 4 secciones
 * de servicio; reporta viejo → nuevo y no pisa nada más.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PAGE = "servicios"

/* Valor oficial de cada eyebrow. "" = sin eyebrow (el título carga la sección). */
const TARGETS: Record<string, string> = {
  servicio_01: "Servicio principal",
  servicio_02: "",
  servicio_03: "",
  servicio_04: "",
}

async function run() {
  console.log("✏️  Reconciliando eyebrows de /servicios (sin números)...\n")

  for (const [section, target] of Object.entries(TARGETS)) {
    const { data: row, error } = await admin
      .from("content_blocks")
      .select("id, value, value_long")
      .eq("page", PAGE)
      .eq("section", section)
      .eq("field", "eyebrow")
      .maybeSingle()

    if (error) {
      console.error(`❌ ${section}.eyebrow: ${error.message}`)
      continue
    }
    if (!row) {
      console.log(`= ${section}.eyebrow: no existe en la base (usa el fallback del esquema)`)
      continue
    }

    const current = row.value_long ?? row.value ?? ""
    if (current === target) {
      console.log(`= ${section}.eyebrow: ya correcto ("${current}")`)
      continue
    }

    const { error: upErr } = await admin
      .from("content_blocks")
      .update({ value: target, value_long: null })
      .eq("id", row.id)

    if (upErr) {
      console.error(`❌ ${section}.eyebrow: ${upErr.message}`)
      continue
    }
    console.log(`✅ ${section}.eyebrow\n     viejo: "${current}"\n     nuevo: "${target}"`)
  }

  console.log("\n✅ Reconciliación de eyebrows completada.")
}

run().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
