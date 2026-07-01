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

/**
 * Fuentes por campo. SOLO las 3 familias que ya usa el sitio (no se agregan
 * nuevas): Marian puede cambiar la tipografía de un título/párrafo puntual
 * entre ellas, o dejar la ORIGINAL del diseño. `css` = valor font-family con la
 * variable de next/font correspondiente; `null` = no tocar (usa la del diseño).
 */
export const FIELD_FONTS = [
  { key: "default", label: "Original (según el diseño)", css: null },
  { key: "playfair", label: "Playfair — títulos elegantes", css: "var(--font-playfair-display), serif" },
  { key: "sans", label: "DM Sans — cuerpo", css: "var(--font-dm-sans), sans-serif" },
  { key: "mono", label: "DM Mono — técnica", css: "var(--font-dm-mono), monospace" },
] as const

export type FieldFontKey = (typeof FIELD_FONTS)[number]["key"]

export const DEFAULT_FIELD_FONT: FieldFontKey = "default"

const FONT_CSS: Record<string, string | null> = Object.fromEntries(
  FIELD_FONTS.map((f) => [f.key, f.css]),
)
const FONT_LABELS: Record<string, string> = Object.fromEntries(
  FIELD_FONTS.map((f) => [f.key, f.label]),
)

export function isValidFieldFont(key: string): key is FieldFontKey {
  return FIELD_FONTS.some((f) => f.key === key)
}

/** Lleva cualquier clave a una válida: desconocida/None → "default". */
export function normalizeFieldFont(key: string | null | undefined): FieldFontKey {
  return key && isValidFieldFont(key) ? key : DEFAULT_FIELD_FONT
}

/** Valor CSS font-family de la fuente elegida, o undefined si es la original. */
export function fontCss(key: string | null | undefined): string | undefined {
  return FONT_CSS[normalizeFieldFont(key)] ?? undefined
}

export function fontLabel(key: string | null | undefined): string {
  return FONT_LABELS[normalizeFieldFont(key)]
}

/** Estilo elegido para un campo: tamaño (mobile/desktop) + fuente. */
export type FieldScale = { m?: string | null; d?: string | null; font?: string | null }

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
  const font = fontCss(scale?.font)
  const sizeChanged = !(m === 1 && d === 1)

  // Sin cambios de tamaño NI de fuente: el elemento queda idéntico al diseño.
  if (!sizeChanged && !font) {
    return baseStyle ? { style: baseStyle } : {}
  }

  const style: CSSProperties = { ...baseStyle }
  // La fuente elegida gana sobre className/baseStyle (inline > clase).
  if (font) style.fontFamily = font
  if (sizeChanged) {
    ;(style as Record<string, unknown>)["--fs-local-m"] = m
    ;(style as Record<string, unknown>)["--fs-local-d"] = d
  }
  const res: FsResult = { style }
  if (sizeChanged) res["data-fscale"] = ""
  return res
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
