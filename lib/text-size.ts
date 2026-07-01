import type { CSSProperties } from "react"

/**
 * Tamaños de texto por campo (tabla text_sizes). Marian elige, por párrafo/
 * título puntual, entre tamaños PREDEFINIDOS, independientes mobile/desktop.
 *
 * FONT-SAFE POR DISEÑO: el factor solo multiplica el `--text-scale` LOCAL del
 * elemento (el mismo motor que /admin/tipografia). Nunca toca la fuente ni el
 * tamaño base — solo lo escala. Ver reglas [data-fscale] en globals.css.
 *
 * Módulo puro (sin imports de servidor): se usa en Server y Client Components.
 */

export const TEXT_SIZE_PRESETS = [
  { key: "normal", label: "Normal", factor: 1 },
  { key: "grande", label: "Grande", factor: 1.15 },
  { key: "mas_grande", label: "Más grande", factor: 1.3 },
  { key: "maximo", label: "Máximo", factor: 1.5 },
] as const

export type TextSizeKey = (typeof TEXT_SIZE_PRESETS)[number]["key"]

export const DEFAULT_TEXT_SIZE: TextSizeKey = "normal"

const FACTORS: Record<string, number> = Object.fromEntries(
  TEXT_SIZE_PRESETS.map((p) => [p.key, p.factor]),
)

export function isValidTextSize(key: string): key is TextSizeKey {
  return TEXT_SIZE_PRESETS.some((p) => p.key === key)
}

/** Factor numérico de un preset. Desconocido/None → 1 (sin cambio). */
export function sizeFactor(key: string | null | undefined): number {
  if (!key || !(key in FACTORS)) return 1
  return FACTORS[key]
}

/** Tamaño elegido para un campo: claves de preset mobile/desktop. */
export type FieldScale = { m?: string | null; d?: string | null }

/** Mapa "section.field" → FieldScale, para una página. */
export type FieldScaleMap = Record<string, FieldScale>

/** Clave del mapa para un campo. */
export function scaleKey(section: string, field: string): string {
  return `${section}.${field}`
}

/**
 * Props a esparcir en el elemento de un título/párrafo resizable. Fusiona el
 * `baseStyle` del elemento con las variables locales y agrega `data-fscale`
 * SOLO si hay un tamaño distinto de "normal" (si no, el elemento queda idéntico).
 *
 *   <h2 className="…" {...fsProps(scales, "hero", "h1", { fontSize: "var(--fs-h2)" })}>
 */
export function fsProps(
  scales: FieldScaleMap | undefined,
  section: string,
  field: string,
  baseStyle?: CSSProperties,
): { style?: CSSProperties } & Record<string, unknown> {
  return fsStyle(scales?.[scaleKey(section, field)], baseStyle)
}

/**
 * Igual que fsProps pero a partir de un FieldScale directo (ya resuelto). Útil
 * cuando el componente ya recibió el tamaño de un campo puntual.
 */
export function fsStyle(
  scale: FieldScale | undefined,
  baseStyle?: CSSProperties,
): { style?: CSSProperties } & Record<string, unknown> {
  const m = sizeFactor(scale?.m)
  const d = sizeFactor(scale?.d)
  if (m === 1 && d === 1) {
    return baseStyle ? { style: baseStyle } : {}
  }
  return {
    "data-fscale": "",
    style: {
      ...baseStyle,
      ["--fs-local-m" as string]: m,
      ["--fs-local-d" as string]: d,
    } as CSSProperties,
  }
}
