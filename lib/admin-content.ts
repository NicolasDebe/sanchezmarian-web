import { createAdminClient } from "@/lib/supabase"
import { normalizeTextSize, normalizeFieldFont } from "@/lib/text-size"
import type { SectionDef } from "@/lib/content-schema"
import type { EditorSection } from "@/components/admin/content-editor"

/**
 * Carga el contenido editable de una página desde Supabase (service_role) y lo
 * combina con el esquema para producir las secciones que consume el editor.
 *
 * A diferencia del sitio público, acá SÍ queremos enterarnos si Supabase falla
 * (es el admin): devolvemos `{ error: true }` para mostrar un mensaje.
 */
export async function loadEditorSections(
  page: string,
  schema: SectionDef[],
): Promise<{ sections?: EditorSection[]; error?: boolean }> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("content_blocks")
    .select("section, field, value, value_long")
    .eq("page", page)

  if (error) return { error: true }

  const dbMap = new Map<string, string>()
  for (const row of data ?? []) {
    const v = row.value_long ?? row.value
    if (v != null) dbMap.set(`${row.section}.${row.field}`, v)
  }

  // Tamaños por campo (tabla text_sizes). Resiliente: si no existe todavía,
  // seguimos sin tamaños (el admin funciona igual, todos en "normal").
  const sizeMap = new Map<string, { m: string; d: string }>()
  try {
    const { data: sizes } = await admin
      .from("text_sizes")
      .select("section, field, scale_mobile, scale_desktop")
      .eq("page", page)
    for (const row of sizes ?? []) {
      sizeMap.set(`${row.section}.${row.field}`, {
        m: normalizeTextSize(row.scale_mobile as string),
        d: normalizeTextSize(row.scale_desktop as string),
      })
    }
  } catch {
    // Tabla inexistente: ignorar.
  }

  // Fuentes por campo (tabla field_fonts). Independiente y resiliente igual que
  // los tamaños: si no existe todavía, todos quedan en "default" (original).
  const fontMap = new Map<string, string>()
  try {
    const { data: fonts } = await admin
      .from("field_fonts")
      .select("section, field, font")
      .eq("page", page)
    for (const row of fonts ?? []) {
      fontMap.set(`${row.section}.${row.field}`, normalizeFieldFont(row.font as string))
    }
  } catch {
    // Tabla inexistente: ignorar.
  }

  const sections: EditorSection[] = schema.map((s) => ({
    section: s.section,
    title: s.title,
    legend: s.legend,
    fields: s.fields.map((f) => {
      const size = sizeMap.get(`${s.section}.${f.field}`)
      return {
        field: f.field,
        type: f.type,
        label: f.label,
        plain: f.plain,
        options: f.options,
        maxChars: f.maxChars,
        help: f.help,
        resizable: f.resizable,
        scaleMobile: size?.m ?? "normal",
        scaleDesktop: size?.d ?? "normal",
        font: fontMap.get(`${s.section}.${f.field}`) ?? "default",
        value: dbMap.get(`${s.section}.${f.field}`) ?? f.fallback,
      }
    }),
  }))

  return { sections }
}
