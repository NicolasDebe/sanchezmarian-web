/**
 * Esquema de contenido editable de /casos-de-exito.
 *
 * SOLO migramos el hero y las stats. Los clientes y sus coberturas (timeline)
 * quedan hardcodeados (data/clippings.ts): requieren tablas `clients` +
 * `coverages` en una iteración futura — ver CONTEXTO_PROYECTO.md.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const CASOS_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    legend:
      "La segunda línea del título (destacada) se muestra en cursiva bordó automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Casos de éxito" },
      { field: "h1_pre", type: "text", label: "Título — primera línea", fallback: "El impacto de una buena estrategia" },
      { field: "h1_accent", type: "text", label: "Título — segunda línea (destacada, cursiva)", fallback: "se mide en presencia real." },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Una selección de gestiones de prensa realizadas para marcas, empresas y profesionales que confiaron en la estrategia. Cada caso cuenta una historia.",
      },
    ],
  },
  {
    section: "stats",
    title: "Stats (estadísticas)",
    fields: [
      { field: "stat_1_number", type: "text", label: "Estadística 1 — Número", fallback: "100+" },
      { field: "stat_1_label", type: "text", label: "Estadística 1 — Label", fallback: "coberturas verificadas" },
      { field: "stat_2_number", type: "text", label: "Estadística 2 — Número", fallback: "30+" },
      { field: "stat_2_label", type: "text", label: "Estadística 2 — Label", fallback: "medios distintos" },
      { field: "stat_3_number", type: "text", label: "Estadística 3 — Número", fallback: "5" },
      { field: "stat_3_label", type: "text", label: "Estadística 3 — Label", fallback: "formatos cubiertos" },
      { field: "stat_4_number", type: "text", label: "Estadística 4 — Número", fallback: "15" },
      { field: "stat_4_label", type: "text", label: "Estadística 4 — Label", fallback: "marcas activas" },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(CASOS_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(CASOS_SECTIONS, section, field)
}
