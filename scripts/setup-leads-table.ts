/**
 * Crea la tabla `leads` en Supabase SIN abrir el dashboard ni pegar SQL a mano.
 * Usa una conexión directa de Postgres (DDL no se puede correr vía PostgREST).
 *
 * Ejecutar: npx tsx scripts/setup-leads-table.ts
 *
 * Requiere POSTGRES_URL_NON_POOLING en .env.local. Si falta, conseguila desde
 * Supabase Dashboard → Project Settings → Database → Connection string → URI
 * (modo "Direct connection", reemplazando [YOUR-PASSWORD]), o pulando el env de
 * Vercel: npx vercel env pull (la integración de Supabase ya la deja seteada).
 *
 * Idempotente: CREATE TABLE IF NOT EXISTS + DROP/CREATE POLICY.
 */
import * as dotenv from "dotenv"
import path from "path"
import postgres from "postgres"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING

if (!POSTGRES_URL) {
  console.error("✗ Falta POSTGRES_URL_NON_POOLING en .env.local")
  console.error(
    "  Conseguila en Supabase Dashboard → Settings → Database → Connection string → URI",
  )
  console.error("  (modo Direct connection), o con: npx vercel env pull")
  process.exit(1)
}

const sql = postgres(POSTGRES_URL, { ssl: "require" })

async function main() {
  console.log("Creando tabla leads...")

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE leads ENABLE ROW LEVEL SECURITY`

  await sql`DROP POLICY IF EXISTS "Insert público leads" ON leads`
  await sql`
    CREATE POLICY "Insert público leads"
      ON leads FOR INSERT
      WITH CHECK (true)
  `

  await sql`DROP POLICY IF EXISTS "Solo auth pueden leer leads" ON leads`
  await sql`
    CREATE POLICY "Solo auth pueden leer leads"
      ON leads FOR SELECT
      USING (auth.role() = 'authenticated')
  `

  const result = await sql`SELECT count(*) as count FROM leads`
  console.log(`✅ Tabla leads lista. Registros actuales: ${result[0].count}`)

  await sql.end()
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
