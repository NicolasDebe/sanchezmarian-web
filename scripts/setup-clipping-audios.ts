/**
 * Setup de audios para clippings.
 *
 *  - DDL (si hay POSTGRES_URL_NON_POOLING real): agrega columnas audio_url y
 *    audio_duration_seconds, hace url nullable y agrega el constraint
 *    clipping_has_content (url O audio_url).
 *  - Bucket: crea el bucket público "clipping-audios" (30 MB) vía service role.
 *
 * La conexión directa de Postgres suele venir REDACTADA tanto en .env.local como
 * en Vercel (la integración de Supabase oculta la password). Si falta, el script
 * igual crea el bucket y te imprime el SQL exacto para pegar en
 * Supabase Dashboard → SQL Editor (mismo SQL que supabase/migrations/
 * 20260628_clipping_audios.sql). Idempotente.
 *
 * Ejecutar: npx tsx scripts/setup-clipping-audios.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import postgres from "postgres"
import { createClient } from "@supabase/supabase-js"

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const DDL_SQL = `-- Audios de clippings
ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER;
ALTER TABLE clippings ALTER COLUMN url DROP NOT NULL;
ALTER TABLE clippings DROP CONSTRAINT IF EXISTS clipping_has_content;
ALTER TABLE clippings ADD CONSTRAINT clipping_has_content
  CHECK (url IS NOT NULL OR audio_url IS NOT NULL);`

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

async function runDDL() {
  if (!POSTGRES_URL) {
    console.log("\n⚠ POSTGRES_URL_NON_POOLING no está disponible (redactada).")
    console.log("  Las columnas/constraint NO se crearon automáticamente.")
    console.log("  Pegá este SQL en Supabase Dashboard → SQL Editor (idempotente):\n")
    console.log(DDL_SQL)
    console.log("")
    return false
  }

  const sql = postgres(POSTGRES_URL, { ssl: "require" })
  try {
    console.log("Paso 1: columnas audio en clippings...")
    await sql`ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_url TEXT`
    await sql`ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER`

    console.log("Paso 2: url nullable...")
    await sql`ALTER TABLE clippings ALTER COLUMN url DROP NOT NULL`

    console.log("Paso 3: constraint clipping_has_content (url O audio_url)...")
    await sql`ALTER TABLE clippings DROP CONSTRAINT IF EXISTS clipping_has_content`
    await sql`
      ALTER TABLE clippings
      ADD CONSTRAINT clipping_has_content
      CHECK (url IS NOT NULL OR audio_url IS NOT NULL)
    `

    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clippings'
        AND column_name IN ('url', 'audio_url', 'audio_duration_seconds')
      ORDER BY column_name
    `
    console.log("Columnas verificadas:", result)
    return true
  } finally {
    await sql.end()
  }
}

async function createBucket() {
  console.log("Paso 4: bucket clipping-audios en Supabase Storage...")
  const { data: buckets, error: listErr } = await admin.storage.listBuckets()
  if (listErr) console.error("Error listando buckets:", listErr)

  const exists = buckets?.some((b) => b.name === "clipping-audios")
  if (exists) {
    console.log("✅ Bucket clipping-audios ya existe.")
    return
  }

  const { error: createErr } = await admin.storage.createBucket("clipping-audios", {
    public: true,
    fileSizeLimit: 31457280, // 30 MB
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/ogg",
      "audio/x-m4a",
    ],
  })
  if (createErr) {
    console.error("Error creando bucket:", createErr)
    process.exit(1)
  }
  console.log("✅ Bucket clipping-audios creado.")
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
