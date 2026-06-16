/**
 * Lista order_position actuales de todos los clientes activos.
 * Solo lectura — sirve para auditar antes de normalizar.
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

async function run() {
  const { data, error } = await admin
    .from("clients")
    .select("id, slug, name, order_position, is_active")
    .order("order_position", { ascending: true })
    .order("name", { ascending: true })

  if (error || !data) {
    console.error("✗ Error:", error?.message)
    process.exit(1)
  }

  console.log(`\n${data.length} clientes (orden actual, también ordenado por name como tiebreaker):\n`)
  const counts = new Map<number, number>()
  for (const c of data) {
    counts.set(c.order_position, (counts.get(c.order_position) ?? 0) + 1)
  }
  for (const c of data) {
    const dup = (counts.get(c.order_position) ?? 0) > 1 ? " ← duplicado" : ""
    const inactive = c.is_active ? "" : " (inactivo)"
    console.log(`  ${String(c.order_position).padStart(4)}  ${c.slug.padEnd(22)} ${c.name}${inactive}${dup}`)
  }
  console.log()
}

run().catch((err) => {
  console.error("✗ Error inesperado:", err)
  process.exit(1)
})
