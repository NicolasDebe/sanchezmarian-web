import { createAdminClient } from "@/lib/supabase"
import { HOME_SECTIONS } from "@/lib/home-schema"
import { HomeEditor, type EditorSection } from "./editor"

export const dynamic = "force-dynamic"

export default async function EditHomePage() {
  const admin = createAdminClient()

  // Lectura directa de Supabase. A diferencia del sitio público, acá SÍ queremos
  // enterarnos si Supabase no responde (es el admin), así que mostramos un error.
  const { data, error } = await admin
    .from("content_blocks")
    .select("section, field, value, value_long")
    .eq("page", "home")

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--color-bordo)" }}>
          No pudimos cargar el contenido
        </h1>
        <p className="mt-2 font-sans text-sm" style={{ color: "var(--color-gris-bordo)" }}>
          Hubo un problema al conectar con la base de datos. Recargá la página en
          un momento.
        </p>
      </div>
    )
  }

  // Map "section.field" -> valor guardado
  const dbMap = new Map<string, string>()
  for (const row of data ?? []) {
    const v = row.value_long ?? row.value
    if (v != null) dbMap.set(`${row.section}.${row.field}`, v)
  }

  // Estructura para el editor: usa el esquema (orden + labels + tipos) y superpone
  // los valores guardados; si falta alguno, usa el fallback del esquema.
  const sections: EditorSection[] = HOME_SECTIONS.map((s) => ({
    section: s.section,
    title: s.title,
    fields: s.fields.map((f) => ({
      field: f.field,
      type: f.type,
      label: f.label,
      value: dbMap.get(`${s.section}.${f.field}`) ?? f.fallback,
    })),
  }))

  return (
    <div className="mx-auto max-w-3xl">
      <p
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
      >
        Editar contenido
      </p>
      <h1
        className="mt-2 mb-6 font-playfair font-bold"
        style={{ fontSize: "2.25rem", color: "var(--color-negro-bordo)" }}
      >
        Home
      </h1>

      <HomeEditor sections={sections} />
    </div>
  )
}
