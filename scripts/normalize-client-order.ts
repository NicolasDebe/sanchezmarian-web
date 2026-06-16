/**
 * Normaliza order_position de la tabla clients: 10, 20, 30, ...
 * Mantiene el orden actual (order_position ASC, name ASC) pero asigna
 * gaps de 10 entre cada cliente. Idempotente.
 *
 * Ejecutar: npx tsx scripts/normalize-client-order.ts
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

const STEP = 10

async function run() {
  console.log("🔧 Normalize order_position de clients (step = 10)\n")

  const { data, error } = await admin
    .from("clients")
    .select("id, slug, name, order_position, is_active")
    .order("order_position", { ascending: true })
    .order("name", { ascending: true })

  if (error || !data) {
    console.error("✗ Error leyendo clients:", error?.message)
    process.exit(1)
  }

  console.log(`Encontrados ${data.length} clientes.\n`)

  const updates: { id: string; from: number; to: number; name: string }[] = []
  data.forEach((c, idx) => {
    const newOrder = (idx + 1) * STEP
    if (c.order_position !== newOrder) {
      updates.push({ id: c.id, from: c.order_position, to: newOrder, name: c.name })
    }
  })

  if (updates.length === 0) {
    console.log("✓ Ya está normalizado, nada que hacer.")
  } else {
    console.log(`Aplicando ${updates.length} updates:`)
    for (const u of updates) {
      console.log(`  ${String(u.from).padStart(4)} → ${String(u.to).padStart(4)}  ${u.name}`)
    }
    console.log()

    const results = await Promise.all(
      updates.map((u) =>
        admin.from("clients").update({ order_position: u.to }).eq("id", u.id),
      ),
    )

    const failed = results.filter((r) => r.error)
    if (failed.length > 0) {
      console.error(`✗ ${failed.length} update(s) fallaron:`)
      for (const r of failed) console.error("   ", r.error?.message)
      process.exit(1)
    }
    console.log("✓ Updates aplicados.")
  }

  // Verificación
  const { data: after, error: e2 } = await admin
    .from("clients")
    .select("id, slug, name, order_position")
    .order("order_position", { ascending: true })

  if (e2 || !after) {
    console.error("✗ Error verificando:", e2?.message)
    process.exit(1)
  }

  const seen = new Set<number>()
  let hasDup = false
  for (const c of after) {
    if (seen.has(c.order_position)) hasDup = true
    seen.add(c.order_position)
  }

  console.log("\n📊 Estado final:")
  for (const c of after) {
    console.log(`  ${String(c.order_position).padStart(4)}  ${c.slug.padEnd(22)} ${c.name}`)
  }

  if (hasDup) {
    console.error("\n✗ FAIL: hay order_position duplicados.")
    process.exit(1)
  }
  console.log("\n✅ order_position únicos, normalización OK.")
}

run().catch((err) => {
  console.error("✗ Error inesperado:", err)
  process.exit(1)
})
