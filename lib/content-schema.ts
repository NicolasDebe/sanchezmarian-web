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
   * Si true, el campo muestra en el admin el panel "Apariencia del texto":
   * tamaño (mobile/desktop, 8 pasos) + fuente (entre las 3 del sitio).
   *
   * CONTRATO DE DOS MITADES — marcar esto NO alcanza. El elemento del sitio
   * público tiene que emitir `data-fkey="section.field"` vía fsStyle/fsProps
   * (o `fkey` en <RichText>). Si falta esa mitad, Marian mueve el control,
   * guarda… y no pasa nada. `node scripts/check-text-sizes.mjs` cruza ambas
   * mitades y falla si alguna se quedó a medio camino.
   *
   * CONVENCIONES:
   *  - Textos partidos en {x}_pre / {x}_accent: el campo resizable es el `_pre`
   *    y su fkey va en el elemento que envuelve a los dos (es un solo título en
   *    pantalla). El `_accent` NO se marca resizable.
   *  - Listas de un solo campo multilínea (`*_items`): el fkey va en el <ul> y
   *    los <li> heredan el --text-scale local.
   *  - Se dejan FIJOS (sin resizable) los textos de UI cuya caja no acompaña al
   *    texto: botones/CTAs, links del nav, pills, badges y tags.
   *
   * Ver lib/text-size.ts y las reglas [data-fscale] de app/globals.css.
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
