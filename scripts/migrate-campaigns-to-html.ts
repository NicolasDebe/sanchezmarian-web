/**
 * Migración: campaigns.content → HTML.
 * Idempotente: las campañas cuyo content ya tiene tags HTML se saltean
 * (las 3 existentes ya estaban en HTML desde el seed).
 *
 * Ejecutar: npx tsx scripts/migrate-campaigns-to-html.ts
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

async function main() {
  const { data: rows, error } = await admin
    .from("campaigns")
    .select("id, slug, content")
    .order("created_at")

  if (error) {
    console.error("✗ No se pudo leer campaigns:", error.message)
    process.exit(1)
  }

  let migrated = 0
  let skipped = 0

  for (const row of rows ?? []) {
    const content = (row.content ?? "") as string

    if (!content.trim()) {
      skipped++
      console.log(`  − [vacío] ${row.slug}`)
      continue
    }
    if (hasHtmlTags(content)) {
      skipped++
      console.log(`  − [ya HTML] ${row.slug}`)
      continue
    }

    const html = plainToHtml(content)
    const { error: updateErr } = await admin
      .from("campaigns")
      .update({ content: html, updated_at: new Date().toISOString() })
      .eq("id", row.id)

    if (updateErr) {
      console.error(`  ✗ [update falló] ${row.slug}: ${updateErr.message}`)
      continue
    }
    migrated++
    console.log(`  ✓ [migrado] ${row.slug}`)
  }

  console.log(`\nResultado: ${migrated} migradas · ${skipped} ya estaban OK`)
}

main().catch((e) => {
  console.error("FATAL:", e)
  process.exit(1)
})
