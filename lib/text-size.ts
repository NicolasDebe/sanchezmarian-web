import type { CSSProperties } from "react"

/**
 * Tamaños de texto por campo (tabla text_sizes). Marian ajusta, por título/
 * párrafo, con un slider de 8 pasos (muy pequeño → muy grande), independiente
 * mobile/desktop, viendo el cambio EN VIVO en un preview del sitio real.
 *
 * FONT-SAFE POR DISEÑO: el factor solo multiplica el `--text-scale` LOCAL del
 * elemento (el mismo motor que /admin/tipografia). Nunca toca la fuente ni el
 * tamaño base — solo lo escala. Ver reglas [data-fscale] en globals.css.
 *
 * Cada texto editable lleva `data-fkey="section.field"` (lo emiten fsStyle/
 * fsProps): es la marca que el puente de preview (TextSizePreviewBridge) usa
 * para aplicar tamaños en tiempo real.
 *
 * Módulo puro (sin imports de servidor): se usa en Server y Client Components.
 */

export const TEXT_SIZE_PRESETS = [
  { key: "xs", label: "Muy pequeño", factor: 0.8 },
  { key: "s", label: "Pequeño", factor: 0.88 },
  { key: "sm", label: "Algo pequeño", factor: 0.94 },
  { key: "normal", label: "Normal", factor: 1.0 },
  { key: "ml", label: "Algo grande", factor: 1.1 },
  { key: "l", label: "Grande", factor: 1.22 },
  { key: "xl", label: "Muy grande", factor: 1.38 },
  { key: "xxl", label: "Máximo", factor: 1.55 },
] as const

export type TextSizeKey = (typeof TEXT_SIZE_PRESETS)[number]["key"]

export const DEFAULT_TEXT_SIZE: TextSizeKey = "normal"

/** Claves ordenadas (para el slider: índice ↔ clave). */
export const TEXT_SIZE_KEYS = TEXT_SIZE_PRESETS.map((p) => p.key) as TextSizeKey[]

const FACTORS: Record<string, number> = Object.fromEntries(
  TEXT_SIZE_PRESETS.map((p) => [p.key, p.factor]),
)
const LABELS: Record<string, string> = Object.fromEntries(
  TEXT_SIZE_PRESETS.map((p) => [p.key, p.label]),
)

/**
 * Claves de la escala vieja de 4 pasos → equivalente más cercano en la de 8.
 * Así los tamaños ya guardados por Marian no se pierden al migrar la escala.
 */
const LEGACY_ALIASES: Record<string, TextSizeKey> = {
  grande: "l",
  mas_grande: "xl",
  maximo: "xxl",
}

export function isValidTextSize(key: string): key is TextSizeKey {
  return TEXT_SIZE_PRESETS.some((p) => p.key === key)
}

/**
 * Lleva cualquier clave a una válida de la escala actual: válida → tal cual,
 * clave vieja → su alias, desconocida/None → "normal".
 */
export function normalizeTextSize(key: string | null | undefined): TextSizeKey {
  if (key && isValidTextSize(key)) return key
  if (key && key in LEGACY_ALIASES) return LEGACY_ALIASES[key]
  return DEFAULT_TEXT_SIZE
}

/** Factor numérico de un preset. Desconocido/None → 1 (sin cambio). */
export function sizeFactor(key: string | null | undefined): number {
  return FACTORS[normalizeTextSize(key)]
}

export function sizeLabel(key: string | null | undefined): string {
  return LABELS[normalizeTextSize(key)]
}

/** Índice en el slider (0..7). Desconocido → índice de "normal". */
export function sizeIndex(key: string | null | undefined): number {
  return TEXT_SIZE_KEYS.indexOf(normalizeTextSize(key))
}

/** Tamaño elegido para un campo: claves de preset mobile/desktop. */
export type FieldScale = { m?: string | null; d?: string | null }

/** Mapa "section.field" → FieldScale, para una página. */
export type FieldScaleMap = Record<string, FieldScale>

/** Clave del mapa para un campo. */
export function scaleKey(section: string, field: string): string {
  return `${section}.${field}`
}

type FsResult = { style?: CSSProperties } & Record<string, unknown>

function localVars(scale: FieldScale | undefined, baseStyle?: CSSProperties): FsResult {
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

/**
 * Props a esparcir en el elemento de un título/párrafo editable a partir de un
 * FieldScale ya resuelto. Emite:
 *  - el tamaño GUARDADO ya aplicado (SSR, sin flash),
 *  - `data-fkey="section.field"` si se pasa `fkey` (marca para el preview vivo),
 *  - fusiona el `baseStyle` del elemento.
 *
 *   <h2 className="…" {...fsStyle(scales?.["hero.h1"], { fontSize: "var(--fs-h2)" }, "hero.h1")}>
 */
export function fsStyle(
  scale: FieldScale | undefined,
  baseStyle?: CSSProperties,
  fkey?: string,
): FsResult {
  const base = localVars(scale, baseStyle)
  return fkey ? { "data-fkey": fkey, ...base } : base
}

/**
 * Igual que fsStyle pero resolviendo el FieldScale desde el mapa de la página
 * (`scales`) con section/field. Siempre emite `data-fkey`.
 *
 *   <h2 className="…" {...fsProps(scales, "hero", "h1", { fontSize: "var(--fs-h2)" })}>
 */
export function fsProps(
  scales: FieldScaleMap | undefined,
  section: string,
  field: string,
  baseStyle?: CSSProperties,
): FsResult {
  const key = scaleKey(section, field)
  return fsStyle(scales?.[key], baseStyle, key)
}
