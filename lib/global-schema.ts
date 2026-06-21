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
    section: "metadata",
    title: "Compartir en redes (OpenGraph por defecto)",
    legend:
      "Título, descripción e imagen que aparecen al compartir CUALQUIER página del sitio en WhatsApp, Twitter/X, LinkedIn o Facebook. Cada página puede tener su propia versión desde el editor de SEO; si no la tiene, usa estos valores.",
    fields: [
      { field: "og_default_title", type: "text", label: "Título por defecto", fallback: "Marian Sánchez — Comunicación estratégica · Mendoza" },
      { field: "og_default_description", type: "longtext", plain: true, label: "Descripción por defecto", fallback: "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina." },
      { field: "og_default_image", type: "text", label: "Imagen por defecto (URL, 1200×630px)", fallback: "/og/default.jpg" },
      { field: "og_site_name", type: "text", label: "Nombre del sitio", fallback: "Marian Sánchez" },
      { field: "twitter_handle", type: "text", label: "Usuario de Twitter/X (opcional, ej: @marian)", fallback: "" },
    ],
  },
  {
    section: "footer",
    title: "Pie de página (Footer)",
    fields: [
      { field: "tagline", type: "text", label: "Frase bajo el logo", fallback: SITE_TAGLINE },
      { field: "email", type: "text", label: "Email de contacto", fallback: SITE_EMAIL },
      { field: "phone", type: "text", label: "Teléfono", fallback: "+54 261 543-3882" },
      { field: "location_tag", type: "text", label: "Ubicación / cobertura", fallback: "Mendoza, Argentina · Trabajo remoto en LATAM" },
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
