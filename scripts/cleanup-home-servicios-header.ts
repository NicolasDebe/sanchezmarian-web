/**
 * Limpieza: elimina las filas huérfanas del encabezado de la sección de
 * servicios del HOME (page='home', section='servicios') que ya NO existen en
 * el schema (lib/home-schema.ts): eyebrow, title_pre, title_accent, subtitle.
 *
 * Idempotente: si las filas ya no existen, no hace nada. Antes de borrar, hace
 * backup del valor actual en content_versions (mismo shape que
 * saveContentSection: content_block_id, value, value_long, version, created_by).
 *
 * Ejecutar UNA vez con: npx tsx scripts/cleanup-home-servicios-header.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const PAGE = "home"
const SECTION = "servicios"
const ORPHAN_FIELDS = ["eyebrow", "title_pre", "title_accent", "subtitle"] as const

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "✗ Falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_URL) en .env.local. Abortando.",
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

async function cleanupUserId(): Promise<string | null> {
  // content_versions.created_by referencia a un usuario; usamos el admin real.
  const { data } = await admin.auth.admin.listUsers()
  const u =
    data?.users.find((x) => x.email === "nicodebe05@gmail.com") ?? data?.users[0]
  return u?.id ?? null
}

async function main() {
  console.log(
    `🧹 Limpieza encabezado de servicios del home (${PAGE}/${SECTION})...\n`,
  )

  const { data: rows, error } = await admin
    .from("content_blocks")
    .select("id, field, value, value_long, version")
    .eq("page", PAGE)
    .eq("section", SECTION)
    .in("field", ORPHAN_FIELDS as unknown as string[])

  if (error) {
    console.error("✗ No se pudo leer content_blocks:", error.message)
    process.exit(1)
  }

  if (!rows || rows.length === 0) {
    console.log("= Nada que limpiar: las filas huérfanas ya no existen.")
    return
  }

  const userId = await cleanupUserId()

  // 1. Backup en content_versions ANTES de borrar.
  const versionRows = rows.map((r) => ({
    content_block_id: r.id,
    value: r.value ?? r.value_long ?? "",
    value_long: r.value_long ?? null,
    version: r.version ?? 1,
    created_by: userId,
  }))
  const { error: backupErr } = await admin
    .from("content_versions")
    .insert(versionRows)
  if (backupErr) {
    console.error(
      `✗ Backup en content_versions falló — NO se borra nada: ${backupErr.message}`,
    )
    process.exit(1)
  }
  console.log(
    `💾 Backup de ${versionRows.length} fila(s) en content_versions (limpieza: campos eliminados del schema).`,
  )

  // 2. DELETE de las filas huérfanas.
  const { error: delErr } = await admin
    .from("content_blocks")
    .delete()
    .eq("page", PAGE)
    .eq("section", SECTION)
    .in("field", ORPHAN_FIELDS as unknown as string[])
  if (delErr) {
    console.error("✗ DELETE falló:", delErr.message)
    process.exit(1)
  }

  for (const r of rows) {
    console.log(`🗑  borrado  ${PAGE}/${SECTION}/${r.field}`)
  }
  console.log(`\n📊 ${rows.length} fila(s) eliminada(s). Listo.`)
}

main()
