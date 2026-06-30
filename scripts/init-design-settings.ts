/**
 * Setup del sistema de presets tipográficos.
 *
 * Crea las tablas design_settings (singleton) y design_settings_history, e
 * inserta la fila singleton con preset 'equilibrado' (factor 1.0) si no existe.
 *
 * La conexión directa de Postgres (POSTGRES_URL_NON_POOLING) suele venir
 * REDACTADA en .env.local / Vercel (la integración de Supabase oculta la
 * password). Si falta, el script imprime el SQL exacto para pegar en
 * Supabase Dashboard → SQL Editor (mismo SQL que
 * supabase/migrations/20260630_design_settings.sql). Idempotente.
 *
 * Ejecutar: npx tsx scripts/init-design-settings.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import postgres from "postgres"

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const DDL_SQL = `-- Sistema de presets tipográficos — singleton + historial
CREATE TABLE IF NOT EXISTS design_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_lock boolean NOT NULL DEFAULT true UNIQUE,
  text_scale_mobile text NOT NULL DEFAULT 'equilibrado',
  text_scale_desktop text NOT NULL DEFAULT 'equilibrado',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text,
  CHECK (text_scale_mobile IN ('denso','compacto','ajustado','comodo','equilibrado','amplio','generoso','editorial')),
  CHECK (text_scale_desktop IN ('denso','compacto','ajustado','comodo','equilibrado','amplio','generoso','editorial'))
);

CREATE TABLE IF NOT EXISTS design_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_scale_mobile text NOT NULL,
  text_scale_desktop text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text
);

INSERT INTO design_settings (singleton_lock, text_scale_mobile, text_scale_desktop)
VALUES (true, 'equilibrado', 'equilibrado')
ON CONFLICT (singleton_lock) DO NOTHING;`

if (!SERVICE_KEY) {
  console.error("✖ Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Abortando.")
  process.exit(1)
}

async function main() {
  if (!POSTGRES_URL || /\*{3,}|REDACTED/i.test(POSTGRES_URL)) {
    console.log("\n⚠ POSTGRES_URL_NON_POOLING no disponible o redactada.")
    console.log("  Las tablas NO se crearon automáticamente.")
    console.log("  Pegá este SQL en Supabase Dashboard → SQL Editor (idempotente):\n")
    console.log(DDL_SQL)
    console.log("")
    process.exit(0)
  }

  const sql = postgres(POSTGRES_URL, { ssl: "require" })
  try {
    console.log("Creando tablas design_settings + design_settings_history...")
    await sql.unsafe(DDL_SQL)

    const rows = await sql`
      SELECT singleton_lock, text_scale_mobile, text_scale_desktop, updated_at
      FROM design_settings
    `
    console.log("✅ Fila singleton:", rows)
    console.log("\n✅ Setup completo.")
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
