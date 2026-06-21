/**
 * Seed del contenido editable de TODO el sitio.
 * Ejecutar con: npx tsx scripts/seed-content.ts
 *
 * Inserta todos los campos definidos en los esquemas (lib/*-schema.ts) a
 * content_blocks, con upsert onConflict='page,section,field' (idempotente).
 * Los valores salen de los esquemas (que salieron del código actual). No inventa.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import type { SectionDef } from "../lib/content-schema"
import { HOME_SECTIONS } from "../lib/home-schema"
import { SERVICIOS_SECTIONS } from "../lib/servicios-schema"
import { MIS_VALORES_SECTIONS } from "../lib/mis-valores-schema"
import { CASOS_SECTIONS } from "../lib/casos-schema"
import { CONTACTO_SECTIONS } from "../lib/contacto-schema"
import { GLOBAL_SECTIONS, GLOBAL_PAGE } from "../lib/global-schema"
import { SEO_SECTIONS, SEO_PAGE } from "../lib/seo-schema"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const PAGES: { page: string; sections: SectionDef[] }[] = [
  { page: "home", sections: HOME_SECTIONS },
  { page: "servicios", sections: SERVICIOS_SECTIONS },
  { page: "mis_valores", sections: MIS_VALORES_SECTIONS },
  { page: "casos_de_exito", sections: CASOS_SECTIONS },
  { page: "contacto", sections: CONTACTO_SECTIONS },
  { page: GLOBAL_PAGE, sections: GLOBAL_SECTIONS },
  { page: SEO_PAGE, sections: SEO_SECTIONS },
]

async function seed() {
  console.log("🌱 Seed de contenido del sitio...\n")

  const rows = PAGES.flatMap(({ page, sections }) =>
    sections.flatMap((sec, sIdx) =>
      sec.fields.map((f, fIdx) => ({
        page,
        section: sec.section,
        field: f.field,
        value: f.fallback,
        value_long: null as string | null,
        field_type: f.type,
        position: sIdx * 100 + fIdx,
      })),
    ),
  )

  // Idempotente: solo inserta los campos que NO existen todavía. ignoreDuplicates
  // deja intactas las filas ya presentes (NO pisa lo que Mariana editó en PROD).
  // Con ignoreDuplicates, .select() devuelve solo las filas realmente insertadas.
  const { data, error } = await admin
    .from("content_blocks")
    .upsert(rows, { onConflict: "page,section,field", ignoreDuplicates: true })
    .select()

  if (error) {
    console.error("✗ Error en el upsert:", error.message)
    process.exit(1)
  }

  const inserted = data?.length ?? 0
  console.log(`✓ ${inserted} campos nuevos insertados (los existentes quedaron intactos).\n`)
  if (inserted > 0) {
    for (const r of data ?? []) {
      console.log(`  + ${r.page}/${r.section}/${r.field}`)
    }
    console.log("")
  }

  // Limpieza de campos obsoletos (reemplazados por el patrón pre/accent).
  const OBSOLETE = [
    { page: "home", section: "metodo", field: "title" },
    { page: "home", section: "bio", field: "title" },
    { page: "home", section: "cta_final", field: "title" },
    // Hero: CTAs largos reemplazados por label/link cortos (sesión home v2).
    { page: "home", section: "hero", field: "cta_primary" },
    { page: "home", section: "hero", field: "cta_secondary" },
    // CTA final: link de WhatsApp redundante eliminado del diseño.
    { page: "home", section: "cta_final", field: "whatsapp_text" },
  ]
  for (const o of OBSOLETE) {
    await admin
      .from("content_blocks")
      .delete()
      .eq("page", o.page)
      .eq("section", o.section)
      .eq("field", o.field)
  }
  console.log(`🧹 ${OBSOLETE.length} campos obsoletos eliminados.\n`)

  for (const { page, sections } of PAGES) {
    const total = sections.reduce((acc, s) => acc + s.fields.length, 0)
    console.log(`  · ${page.padEnd(16)} ${sections.length} secciones · ${total} campos`)
  }

  const { count } = await admin
    .from("content_blocks")
    .select("*", { count: "exact", head: true })

  console.log(`\n📊 Total de filas en content_blocks: ${count}`)
  console.log("✅ Seed completado.")
}

seed().catch((err) => {
  console.error("Error fatal:", err)
  process.exit(1)
})
