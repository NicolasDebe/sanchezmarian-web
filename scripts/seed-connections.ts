/**
 * Seed de la tabla `connections` (sección Conexiones del home).
 * Ejecutar con: npx tsx scripts/seed-connections.ts
 *
 * Requiere que la tabla exista (pegar supabase/migrations/
 * 20260701_connections.sql en el SQL Editor del dashboard).
 *
 * Idempotente: inserta SOLO los labels que falten (match por label), así no
 * duplica ni pisa el orden/estado que Mariana haya editado desde el admin.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { CONNECTIONS_SEED } from "../lib/connections"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function seed() {
  console.log("🌱 Seed de connections...\n")

  const { data: existing, error: readErr } = await admin
    .from("connections")
    .select("label")

  if (readErr) {
    console.error("✗ No se pudo leer connections:", readErr.message)
    if (readErr.message.includes("Could not find the table")) {
      console.error(
        "\n→ La tabla no existe todavía. Pegá el contenido de\n" +
          "  supabase/migrations/20260701_connections.sql\n" +
          "  en el SQL Editor del dashboard de Supabase y volvé a correr esto.",
      )
    }
    process.exit(1)
  }

  const present = new Set((existing ?? []).map((r) => (r.label as string).trim()))

  const rows = CONNECTIONS_SEED
    .map((label, idx) => ({ label, position: idx, is_active: true }))
    .filter((r) => !present.has(r.label))

  if (rows.length === 0) {
    console.log("✓ connections: nada para insertar (ya estaban todas).")
  } else {
    const { error: insertErr } = await admin.from("connections").insert(rows)
    if (insertErr) {
      console.error("✗ Error al insertar connections:", insertErr.message)
      process.exit(1)
    }
    console.log(`✓ connections: ${rows.length} filas insertadas.`)
  }

  const { count } = await admin
    .from("connections")
    .select("*", { count: "exact", head: true })
  console.log(`\n📊 Total: ${count} connections.`)
}

seed()
