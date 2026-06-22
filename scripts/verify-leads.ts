/**
 * Verifica el flujo de leads end-to-end SIN tocar el navegador:
 *   1. Llama al server action createLead (mismo código que usa el form).
 *   2. Prueba validaciones (nombre vacío, email inválido).
 *   3. Lee la fila con el service role (como /admin/suscriptores).
 *   4. Limpia el lead de prueba.
 *
 * Ejecutar (con la tabla `leads` ya creada): npx tsx scripts/verify-leads.ts
 */
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const { createLead } = await import("../app/actions/leads")
  const { createClient } = await import("@supabase/supabase-js")

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const testEmail = `test-leads-${Date.now()}@example.com`

  console.log("1) Validación nombre vacío:")
  console.log("  ", await createLead("", testEmail))

  console.log("2) Validación email inválido:")
  console.log("  ", await createLead("Test Nico", "noesunemail"))

  console.log("3) Alta válida:")
  const ok = await createLead("  Test Nico  ", `  ${testEmail.toUpperCase()}  `)
  console.log("  ", ok)
  if (!ok.success) {
    console.error("✗ La tabla `leads` no existe o el insert falló. Creala primero.")
    process.exit(1)
  }

  console.log("4) Lectura con service role (normaliza email a minúsculas, trim de nombre):")
  const { data, error } = await admin
    .from("leads")
    .select("id, nombre, email, created_at")
    .eq("email", testEmail)
  if (error) {
    console.error("  ✗ error leyendo:", error.message)
    process.exit(1)
  }
  console.log("  ", data)

  console.log("5) Limpieza del lead de prueba:")
  const ids = (data ?? []).map((r) => r.id)
  await admin.from("leads").delete().in("id", ids)
  console.log(`   borrados: ${ids.length}`)

  console.log("\n✅ Flujo de leads verificado.")
}

main().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
