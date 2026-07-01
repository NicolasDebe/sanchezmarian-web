/**
 * Tipos y helpers compartidos por TODOS los esquemas de contenido editable.
 *
 * Cada página tiene su propio archivo de esquema (home-schema.ts,
 * servicios-schema.ts, etc.) que reusa estos tipos. La fuente ÚNICA de verdad
 * de cada página son sus secciones: las usan el sitio público (como fallback),
 * el seed y los editores del admin.
 *
 * PATRÓN pre/accent/post: los textos con acento editorial (parte en italic +
 * color) se parten en 2-3 campos. El styling vive HARDCODED en el JSX; Mariana
 * solo edita texto plano en cada campo y es imposible que rompa el diseño.
 *   - {prefix}_pre    → parte normal antes del acento
 *   - {prefix}_accent → parte con estilo (italic + color)
 *   - {prefix}_post   → parte normal después del acento (opcional)
 *
 * Módulo de data pura (sin imports de servidor): se usa en Server y Client.
 */

export type FieldType = "text" | "longtext" | "number"

export interface SelectOption {
  value: string
  label: string
}

export interface FieldDef {
  field: string
  type: FieldType
  label: string
  fallback: string
  /**
   * Solo para longtext: fuerza <textarea> de texto plano en el admin y excluye
   * el campo de la migración a HTML. Para campos que NO pueden contener tags:
   * meta descriptions de SEO, títulos H1 y partes del patrón pre/accent/post.
   */
  plain?: boolean
  /**
   * Si está presente, el campo (type "text") se edita con un <select> en el
   * admin en vez de un input libre. Útil para toggles/elecciones cerradas
   * como "qué servicio está destacado".
   */
  options?: SelectOption[]
  /** Límite duro de caracteres (texto visible si es rich). */
  maxChars?: number
  /** Ayuda mostrada bajo el label en el admin. */
  help?: string
  /**
   * Si true, el campo (un título o párrafo) muestra en el admin un selector de
   * tamaño (mobile/desktop, tamaños predefinidos) y el sitio público aplica ese
   * tamaño. Solo cambia el font-size, nunca la fuente. Ver lib/text-size.ts.
   */
  resizable?: boolean
}

export interface SectionDef {
  /** slug usado en content_blocks.section */
  section: string
  /** título legible para el acordeón del admin */
  title: string
  /** leyenda explicativa opcional sobre la sección o sus campos con acento */
  legend?: string
  fields: FieldDef[]
}

/** Devuelve el record { field: fallback } de una sección. */
export function fallbacksForIn(
  sections: SectionDef[],
  section: string,
): Record<string, string> {
  const def = sections.find((s) => s.section === section)
  if (!def) return {}
  return Object.fromEntries(def.fields.map((f) => [f.field, f.fallback]))
}

/** Devuelve el fallback de un campo puntual. */
export function fallbackOfIn(
  sections: SectionDef[],
  section: string,
  field: string,
): string {
  return (
    sections
      .find((s) => s.section === section)
      ?.fields.find((f) => f.field === field)?.fallback ?? ""
  )
}
