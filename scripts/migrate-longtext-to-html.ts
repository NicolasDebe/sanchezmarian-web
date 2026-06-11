/**
 * Migración: campos longtext de content_blocks → HTML.
 *
 * - Convierte texto plano a párrafos (<p>, <br />), con escape de & < >.
 * - Idempotente: los campos que ya tienen HTML se saltean.
 * - Hace backup del valor anterior en content_versions antes de cada update.
 * - NO toca: page='seo' (meta descriptions), ni los campos marcados plain en
 *   los esquemas (servicios/hero/h1 y mis_valores/bio/paragraph_1_pre) — esos
 *   se renderizan dentro de <h1>/<p> con acento y no admiten HTML.
 * - NO cambia field_type: sigue siendo 'longtext'.
 *
 * ⚠ Correr DESPUÉS de deployar el código con <RichText />: el código viejo
 *   renderiza el contenido como texto y mostraría los tags literales.
 *
 * Ejecutar: npx tsx scripts/migrate-longtext-to-html.ts
 */
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { hasHtmlTags, plainToHtml } from "../lib/rich-text"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

/** Campos longtext que deben seguir siendo texto plano (no migrar). */
const PLAIN_FIELDS = new Set([
  "mis_valores|bio|paragraph_1_pre", // patrón pre/accent: fluye inline
  "servicios|hero|h1",               // es el H1 de la página
])

async function migrationUserId(): Promise<string | null> {
  // content_versions.created_by referencia a un usuario; usamos el admin real.
  const { data } = await admin.auth.admin.listUsers()
  const u =
    data?.users.find((x) => x.email === "nicodebe05@gmail.com") ?? data?.users[0]
  return u?.id ?? null
}

async function main() {
  const { data: rows, error } = await admin
    .from("content_blocks")
    .select("id, page, section, field, value, value_long, field_type, version")
    .eq("field_type", "longtext")
    .order("page")
    .order("section")

  if (error) {
    console.error("✗ No se pudo leer content_blocks:", error.message)
    process.exit(1)
  }

  const userId = await migrationUserId()
  let migrated = 0
  let skippedHtml = 0
  let skippedPlainPolicy = 0
  let skippedEmpty = 0

  for (const row of rows ?? []) {
    const key = `${row.page}|${row.section}|${row.field}`
    const current = (row.value_long ?? row.value ?? "") as string

    if (row.page === "seo" || PLAIN_FIELDS.has(key)) {
      skippedPlainPolicy++
      console.log(`  − [política plano] ${key}`)
      continue
    }
    if (!current.trim()) {
      skippedEmpty++
      console.log(`  − [vacío] ${key}`)
      continue
    }
    if (hasHtmlTags(current)) {
      skippedHtml++
      console.log(`  − [ya HTML] ${key}`)
      continue
    }

    const html = plainToHtml(current)

    // Backup en content_versions (mismo shape que saveContentSection).
    const { error: backupErr } = await admin.from("content_versions").insert({
      content_block_id: row.id,
      value: current,
      value_long: row.value_long ?? null,
      version: row.version ?? 1,
      created_by: userId,
    })
    if (backupErr) {
      console.error(`  ✗ [backup falló — NO se migra] ${key}: ${backupErr.message}`)
      continue
    }

    const { error: updateErr } = await admin
      .from("content_blocks")
      .update({
        value: html,
        value_long: null,
        version: (row.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)

    if (updateErr) {
      console.error(`  ✗ [update falló] ${key}: ${updateErr.message}`)
      continue
    }
    migrated++
    console.log(`  ✓ [migrado] ${key}`)
  }

  console.log(
    `\nResultado: ${migrated} migrados · ${skippedHtml} ya tenían HTML · ` +
      `${skippedPlainPolicy} excluidos por política (seo/h1/pre-accent) · ${skippedEmpty} vacíos`,
  )
}

main().catch((e) => {
  console.error("FATAL:", e)
  process.exit(1)
})
