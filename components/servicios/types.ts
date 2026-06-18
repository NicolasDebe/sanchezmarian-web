/**
 * Tipos y helpers compartidos de /servicios (v5 — layout estático editorial).
 * El contenido sale SIEMPRE de content_blocks (page='servicios'); estos tipos
 * solo describen la forma ya parseada que consumen los componentes.
 */

export type SubServicio = { titulo: string; desc: string }

export type Servicio = {
  key: string
  nombre: string
  tagline: string
  descripcion: string
  subServicios: SubServicio[]
  cta: string
}

/* Curva expo-out elegante, usada en todas las entradas. */
export const EASE = [0.16, 1, 0.3, 1] as const

export const two = (n: number) => (n < 10 ? `0${n}` : `${n}`)

export function buildServicio(key: string, c: Record<string, string>): Servicio {
  const subServicios = [1, 2, 3]
    .map((n) => ({ titulo: c[`sub_${n}_title`] ?? "", desc: c[`sub_${n}_desc`] ?? "" }))
    .filter((s) => s.titulo.trim() !== "")
  return {
    key,
    nombre: (c.name ?? "").trim(),
    tagline: (c.tagline ?? "").trim(),
    descripcion: (c.description ?? "").trim(),
    subServicios,
    cta: (c.cta_text ?? "").trim() || "Quiero este servicio",
  }
}
