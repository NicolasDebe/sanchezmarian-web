/**
 * Cambia el email de contacto guardado en el CMS (content_blocks) de
 * info@sanchezmarian.com al valor actual de SITE_EMAIL (lib/constants.ts).
 *
 * Por qué hace falta: el CMS tiene prioridad sobre el fallback de las
 * constantes. Cambiar SITE_EMAIL no alcanza si el email ya está guardado en
 * footer / CTA final / contacto, porque el valor de la base gana.
 *
 * Solo toca filas cuyo valor es EXACTAMENTE el email viejo (no pisa lo que
 * Marian haya puesto a mano). Antes de cada update hace backup en
 * content_versions (mismo shape que saveContentSection), así "Deshacer último
 * cambio" del admin lo revierte. Idempotente.
 *
 * Ejecutar con: npx tsx scripts/set-contact-email.ts
 * OJO: pega contra el Supabase de PROD (el de .env.local).
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { SITE_EMAIL } from "../lib/constants"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const OLD_EMAIL = "info@sanchezmarian.com"

const TARGETS = [
  { page: "global", section: "footer", field: "email" },
  { page: "home", section: "cta_final", field: "email" },
  { page: "home", section: "contact", field: "email_value" },
  { page: "contacto", section: "info", field: "email" },
] as const

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "✗ Falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_URL) en .env.local. Abortando.",
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

async function adminUserId(): Promise<string | null> {
  const { data } = await admin.auth.admin.listUsers()
  const u =
    data?.users.find((x) => x.email === "nicodebe05@gmail.com") ?? data?.users[0]
  return u?.id ?? null
}

async function main() {
  console.log(`✉️  ${OLD_EMAIL}  →  ${SITE_EMAIL}\n`)
  const userId = await adminUserId()
  let changed = 0

  for (const t of TARGETS) {
    const { data: row, error } = await admin
      .from("content_blocks")
      .select("id, value, value_long, version")
      .eq("page", t.page)
      .eq("section", t.section)
      .eq("field", t.field)
      .maybeSingle()

    const label = `${t.page}/${t.section}/${t.field}`
    if (error) {
      console.error(`✗ ${label}: no se pudo leer — ${error.message}`)
      process.exit(1)
    }
    if (!row) {
      console.log(`= ${label}: sin override en la base (usa el fallback).`)
      continue
    }
    if (row.value !== OLD_EMAIL) {
      console.log(`= ${label}: vale "${row.value}" — no se toca.`)
      continue
    }

    const { error: backupErr } = await admin.from("content_versions").insert({
      content_block_id: row.id,
      value: row.value ?? row.value_long ?? "",
      value_long: row.value_long ?? null,
      version: row.version ?? 1,
      created_by: userId,
    })
    if (backupErr) {
      console.error(`✗ ${label}: backup falló, NO se modifica — ${backupErr.message}`)
      process.exit(1)
    }

    const { error: updErr } = await admin
      .from("content_blocks")
      .update({
        value: SITE_EMAIL,
        version: (row.version ?? 0) + 1,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
    if (updErr) {
      console.error(`✗ ${label}: update falló — ${updErr.message}`)
      process.exit(1)
    }

    console.log(`✓ ${label}: actualizado (v${row.version ?? 1} → v${(row.version ?? 0) + 1}).`)
    changed++
  }

  console.log(`\n📊 ${changed} fila(s) actualizada(s). Listo.`)
}

main()
