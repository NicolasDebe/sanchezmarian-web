/**
 * Fix: merge del cliente "Bolsa de Comercio" duplicado.
 * El seed de mosto creó slug "bolsa-de-comercio" en vez de usar el
 * original "bolsa-comercio". Este script reasigna los clippings y borra
 * el duplicado.
 *
 * Ejecutar con: npx tsx scripts/fix-duplicate-bolsa.ts
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
  console.log("🔧 Fix duplicate Bolsa de Comercio\n")

  // 1. Encontrar los registros
  const { data: clients, error: e1 } = await admin
    .from("clients")
    .select("id, slug, name, logo_url, order_position, is_active, created_at")
    .ilike("name", "%bolsa%")
    .order("created_at", { ascending: true })

  if (e1 || !clients) {
    console.error("✗ Error leyendo clients:", e1?.message)
    process.exit(1)
  }

  console.log(`Encontrados ${clients.length} clientes:`)
  for (const c of clients) {
    const { count } = await admin
      .from("clippings")
      .select("*", { count: "exact", head: true })
      .eq("client_id", c.id)
    console.log(`  • id=${c.id}`)
    console.log(`    slug=${c.slug}  name="${c.name}"`)
    console.log(`    logo_url=${c.logo_url ?? "(null)"}`)
    console.log(`    is_active=${c.is_active}  order=${c.order_position}  clippings=${count}`)
    console.log(`    created_at=${c.created_at}`)
    console.log()
  }

  if (clients.length !== 2) {
    console.log(`⚠ Esperaba 2 clientes, encontré ${clients.length}. Abortando.`)
    process.exit(clients.length === 1 ? 0 : 1)
  }

  // 2. Identificar original vs nuevo
  // Original = el que tiene logo_url. Nuevo = el de la última seed (slug bolsa-de-comercio sin logo).
  const original = clients.find((c) => c.logo_url && c.slug === "bolsa-comercio")
  const duplicate = clients.find((c) => c.slug === "bolsa-de-comercio")

  if (!original || !duplicate) {
    console.error("✗ No pude identificar cuál es original y cuál duplicado por slug.")
    console.error("   original (slug=bolsa-comercio):", original?.id ?? "NO ENCONTRADO")
    console.error("   duplicate (slug=bolsa-de-comercio):", duplicate?.id ?? "NO ENCONTRADO")
    process.exit(1)
  }

  console.log(`✓ Original: ${original.id} (slug=${original.slug}, con logo)`)
  console.log(`✓ Duplicado: ${duplicate.id} (slug=${duplicate.slug})\n`)

  // 3. Reasignar clippings
  const { data: moved, error: e2 } = await admin
    .from("clippings")
    .update({ client_id: original.id })
    .eq("client_id", duplicate.id)
    .select("id")

  if (e2) {
    console.error("✗ Error reasignando clippings:", e2.message)
    process.exit(1)
  }
  console.log(`✓ Reasignados ${moved?.length ?? 0} clippings al cliente original.\n`)

  // 4. Eliminar duplicado
  const { error: e3 } = await admin.from("clients").delete().eq("id", duplicate.id)
  if (e3) {
    console.error("✗ Error eliminando duplicado:", e3.message)
    process.exit(1)
  }
  console.log(`✓ Cliente duplicado eliminado.\n`)

  // 5. Verificar
  const { count: bolsaCount } = await admin
    .from("clients")
    .select("*", { count: "exact", head: true })
    .ilike("name", "%bolsa%")

  const { count: clippingsCount } = await admin
    .from("clippings")
    .select("*", { count: "exact", head: true })
    .eq("client_id", original.id)

  console.log("📊 Verificación:")
  console.log(`   clients ILIKE '%bolsa%': ${bolsaCount} (esperado: 1)`)
  console.log(`   clippings del original (${original.id}): ${clippingsCount}`)

  if (bolsaCount !== 1) {
    console.error("\n✗ FAIL: hay más de un cliente Bolsa de Comercio.")
    process.exit(1)
  }
  console.log("\n✅ OK")
}

run().catch((err) => {
  console.error("✗ Error inesperado:", err)
  process.exit(1)
})
