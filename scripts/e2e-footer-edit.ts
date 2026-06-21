/**
 * E2E del flujo de edición del footer (phone).
 * Mimetiza el admin: escribe con service_role en content_blocks (como
 * saveContentSection) y lee con la anon key (como el sitio público vía
 * getContentBatch). Al final restaura el valor original.
 *
 * Ejecutar: npx tsx scripts/e2e-footer-edit.ts
 */
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})
const anon = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

const KEY = { page: "global", section: "footer", field: "phone" }
const TEST_VALUE = "+54 261 000-0000 (TEST)"

async function readAnon(): Promise<string | null> {
  const { data } = await anon
    .from("content_blocks")
    .select("value")
    .eq("page", KEY.page).eq("section", KEY.section).eq("field", KEY.field)
    .maybeSingle()
  return data?.value ?? null
}

async function writeAdmin(value: string) {
  const { error } = await admin
    .from("content_blocks")
    .update({ value })
    .eq("page", KEY.page).eq("section", KEY.section).eq("field", KEY.field)
  if (error) throw new Error(`write failed: ${error.message}`)
}

async function main() {
  const original = await readAnon()
  console.log(`1. Valor original (lectura anon): "${original}"`)
  if (original == null) throw new Error("El campo global/footer/phone no existe. ¿Corriste el seed?")

  console.log(`2. Guardando valor de prueba (service_role): "${TEST_VALUE}"`)
  await writeAdmin(TEST_VALUE)

  const afterWrite = await readAnon()
  console.log(`3. Re-lectura pública (anon): "${afterWrite}"`)
  if (afterWrite !== TEST_VALUE) throw new Error("✗ El cambio NO se reflejó en la lectura pública")
  console.log("   ✓ El cambio se refleja en la lectura pública")

  console.log(`4. Revirtiendo al valor original: "${original}"`)
  await writeAdmin(original)
  const afterRevert = await readAnon()
  if (afterRevert !== original) throw new Error("✗ La reversión falló")
  console.log(`   ✓ Revertido OK (lectura anon): "${afterRevert}"`)

  console.log("\n✅ E2E footer-edit completo: write(admin) → read(public) → revert.")
}

main().catch((e) => { console.error(e); process.exit(1) })
