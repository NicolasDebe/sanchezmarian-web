/**
 * Esquema de contenido global (Nav + Footer). Aparece en todas las páginas.
 * Los destinos (href) de los links quedan hardcoded; solo el texto es editable.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn } from "@/lib/content-schema"
import { SITE_EMAIL, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/constants"

export const GLOBAL_PAGE = "global"

export const GLOBAL_SECTIONS: SectionDef[] = [
  {
    section: "nav",
    title: "Menú de navegación",
    legend: "Solo se edita el texto de cada link; los destinos no cambian.",
    fields: [
      { field: "link_servicios", type: "text", label: "Link — Servicios", fallback: "Servicios" },
      { field: "link_valores", type: "text", label: "Link — Mis valores", fallback: "Mis valores" },
      { field: "link_casos", type: "text", label: "Link — Casos de éxito", fallback: "Casos de éxito" },
      { field: "link_campanas", type: "text", label: "Link — Campañas", fallback: "Campañas" },
    ],
  },
  {
    section: "footer",
    title: "Pie de página (Footer)",
    fields: [
      { field: "tagline", type: "text", label: "Frase bajo el logo", fallback: SITE_TAGLINE },
      { field: "email", type: "text", label: "Email de contacto", fallback: SITE_EMAIL },
      { field: "cta_text", type: "text", label: "Texto del botón CTA", fallback: "Conversemos" },
      { field: "instagram_url", type: "text", label: "URL de Instagram", fallback: SOCIAL_LINKS.instagram },
      { field: "linkedin_url", type: "text", label: "URL de LinkedIn", fallback: SOCIAL_LINKS.linkedin },
      { field: "copyright_name", type: "text", label: "Nombre en el copyright", fallback: "Mariana Sánchez" },
      { field: "signature", type: "text", label: "Firma final", fallback: "Diseñado con intención." },
    ],
  },
]

export function globalFallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(GLOBAL_SECTIONS, section)
}
