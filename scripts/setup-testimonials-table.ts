/**
 * Corre la migración de reseñas (supabase/migrations/20260908_testimonials.sql)
 * sin abrir el dashboard: DDL no pasa por PostgREST, hace falta conexión
 * directa de Postgres.
 *
 * Ejecutar: npx tsx scripts/setup-testimonials-table.ts
 *
 * Requiere POSTGRES_URL_NON_POOLING en .env.local (ver scripts/setup-leads-table.ts
 * para cómo conseguirla).
 *
 * IDEMPOTENTE y puramente aditivo: CREATE TABLE / INDEX IF NOT EXISTS y
 * DROP+CREATE POLICY. No borra ni modifica ninguna tabla existente. Se puede
 * correr las veces que haga falta.
 */
import * as dotenv from "dotenv"
import path from "path"
import fs from "fs"
import postgres from "postgres"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING

if (!POSTGRES_URL) {
  console.error("✗ Falta POSTGRES_URL_NON_POOLING en .env.local")
  console.error(
    "  Supabase Dashboard → Settings → Database → Connection string → URI (Direct connection)",
  )
  console.error(
    "  Alternativa: pegar supabase/migrations/20260908_testimonials.sql en el SQL Editor.",
  )
  process.exit(1)
}

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20260908_testimonials.sql",
)

const sql = postgres(POSTGRES_URL, { ssl: "require" })

async function main() {
  const ddl = fs.readFileSync(MIGRATION, "utf8")
  console.log(`Corriendo ${path.basename(MIGRATION)}…`)

  // El archivo entero en una sola transacción: si algo falla, no queda a medias.
  await sql.unsafe(ddl)

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM testimonials
  `
  const cols = await sql<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'testimonials' ORDER BY ordinal_position
  `
  const policies = await sql<{ policyname: string }[]>`
    SELECT policyname FROM pg_policies WHERE tablename = 'testimonials'
  `

  console.log(`✓ Tabla testimonials lista — ${cols.length} columnas, ${count} filas`)
  console.log(`  Policies: ${policies.map((p) => p.policyname).join(", ") || "(ninguna)"}`)
  console.log("\nRecordá setear en Vercel: TESTIMONIAL_IP_SALT, MODERATION_NOTIFY_EMAIL, RESEND_API_KEY")

  await sql.end()
}

main().catch(async (e) => {
  console.error("✗ Falló la migración:", e instanceof Error ? e.message : e)
  await sql.end()
  process.exit(1)
})
