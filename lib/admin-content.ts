import { createAdminClient } from "@/lib/supabase"
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

  const sections: EditorSection[] = schema.map((s) => ({
    section: s.section,
    title: s.title,
    legend: s.legend,
    fields: s.fields.map((f) => ({
      field: f.field,
      type: f.type,
      label: f.label,
      plain: f.plain,
      options: f.options,
      value: dbMap.get(`${s.section}.${f.field}`) ?? f.fallback,
    })),
  }))

  return { sections }
}
