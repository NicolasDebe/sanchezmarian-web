import { loadEditorSections } from "@/lib/admin-content"
import { ContentEditor } from "@/components/admin/content-editor"
import type { SectionDef } from "@/lib/content-schema"

/**
 * Pantalla de edición de una página: carga el contenido, lo combina con el
 * esquema y lo entrega al editor por acordeón. Reutilizada por todas las rutas
 * /admin/edit/*.
 */
export async function AdminEditPage({
  page,
  title,
  schema,
  intro,
}: {
  page: string
  title: string
  schema: SectionDef[]
  intro?: string
}) {
  const { sections, error } = await loadEditorSections(page, schema)

  if (error || !sections) {
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

  return (
    <div className="mx-auto max-w-3xl">
      <p
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
      >
        Editar contenido
      </p>
      <h1
        className="mt-2 mb-2 font-playfair font-bold"
        style={{ fontSize: "2.25rem", color: "var(--color-negro-bordo)" }}
      >
        {title}
      </h1>
      {intro && (
        <p
          className="mb-6 font-sans text-sm leading-relaxed"
          style={{ color: "var(--color-gris-bordo)" }}
        >
          {intro}
        </p>
      )}

      <ContentEditor page={page} sections={sections} />
    </div>
  )
}
