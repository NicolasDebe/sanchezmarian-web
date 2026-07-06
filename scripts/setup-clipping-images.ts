/**
 * Setup de imágenes para clippings.
 *
 *  - DDL (si hay POSTGRES_URL_NON_POOLING real): agrega la columna image_url.
 *  - Bucket: crea el bucket público "clipping-images" (5 MB) vía service role.
 *
 * La conexión directa de Postgres suele venir REDACTADA (la integración de
 * Supabase oculta la password). Si falta, el script igual crea el bucket y te
 * imprime el SQL exacto para pegar en Supabase Dashboard → SQL Editor (mismo SQL
 * que supabase/migrations/20260706_clipping_images.sql). Idempotente.
 *
 * Ejecutar: npx tsx scripts/setup-clipping-images.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import postgres from "postgres"
import { createClient } from "@supabase/supabase-js"

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const BUCKET = "clipping-images"

const DDL_SQL = `-- Imagen por clipping
ALTER TABLE clippings ADD COLUMN IF NOT EXISTS image_url TEXT;`

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

async function runDDL() {
  if (!POSTGRES_URL) {
    console.log("\n⚠ POSTGRES_URL_NON_POOLING no está disponible (redactada).")
    console.log("  La columna image_url NO se creó automáticamente.")
    console.log("  Pegá este SQL en Supabase Dashboard → SQL Editor (idempotente):\n")
    console.log(DDL_SQL)
    console.log("")
    return false
  }

  const sql = postgres(POSTGRES_URL, { ssl: "require" })
  try {
    console.log("Paso 1: columna image_url en clippings...")
    await sql`ALTER TABLE clippings ADD COLUMN IF NOT EXISTS image_url TEXT`

    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clippings' AND column_name = 'image_url'
    `
    console.log("Columna verificada:", result)
    return true
  } finally {
    await sql.end()
  }
}

async function createBucket() {
  console.log("Paso 2: bucket clipping-images en Supabase Storage...")
  const { data: buckets, error: listErr } = await admin.storage.listBuckets()
  if (listErr) console.error("Error listando buckets:", listErr)

  const exists = buckets?.some((b) => b.name === BUCKET)
  if (exists) {
    console.log("✅ Bucket clipping-images ya existe.")
    return
  }

  const { error: createErr } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5_242_880, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  })
  if (createErr) {
    console.error("Error creando bucket:", createErr)
    process.exit(1)
  }
  console.log("✅ Bucket clipping-images creado.")
}

async function main() {
  const ddlOk = await runDDL()
  await createBucket()
  console.log(
    ddlOk
      ? "\n✅ Setup completo (DDL + bucket)."
      : "\n✅ Bucket listo. Falta correr el SQL de arriba en el dashboard para terminar.",
  )
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
