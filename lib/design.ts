export const SCALE_PRESETS = [
  { key: "denso",       label: "Denso",       factor: 0.84 },
  { key: "compacto",    label: "Compacto",    factor: 0.88 },
  { key: "ajustado",    label: "Ajustado",    factor: 0.92 },
  { key: "comodo",      label: "Cómodo",      factor: 0.96 },
  { key: "equilibrado", label: "Equilibrado", factor: 1.00 },
  { key: "amplio",      label: "Amplio",      factor: 1.04 },
  { key: "generoso",    label: "Generoso",    factor: 1.10 },
  { key: "editorial",   label: "Editorial",   factor: 1.16 },
] as const

export type ScalePresetKey = (typeof SCALE_PRESETS)[number]["key"]

export const SCALE_VALUES: Record<ScalePresetKey, number> =
  Object.fromEntries(SCALE_PRESETS.map(p => [p.key, p.factor])) as Record<ScalePresetKey, number>

export const DEFAULT_PRESET: ScalePresetKey = "equilibrado"

export type DesignSettings = {
  text_scale_mobile: ScalePresetKey
  text_scale_desktop: ScalePresetKey
}

export function isValidPreset(key: string): key is ScalePresetKey {
  return SCALE_PRESETS.some(p => p.key === key)
}

export function getScaleValue(key: ScalePresetKey | undefined | null): number {
  if (!key || !isValidPreset(key)) return 1
  return SCALE_VALUES[key]
}
