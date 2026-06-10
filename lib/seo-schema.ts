/**
 * Esquema de metadata SEO editable.
 *
 * Todo el SEO vive bajo page="seo" en content_blocks, con una SECCIÓN por cada
 * página del sitio (home, servicios, …). Cada sección tiene `title` y
 * `description`. Así un único editor (page="seo") cubre todas las páginas y
 * `generateMetadata` de cada página lee su sección.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn } from "@/lib/content-schema"

export const SEO_PAGE = "seo"

export const SEO_SECTIONS: SectionDef[] = [
  {
    section: "home",
    title: "Home",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Marian Sánchez — Comunicación estratégica · Mendoza" },
      { field: "description", type: "longtext", label: "Descripción (meta description)", fallback: "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina." },
    ],
  },
  {
    section: "servicios",
    title: "Servicios",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Servicios — Marian Sánchez" },
      { field: "description", type: "longtext", label: "Descripción (meta description)", fallback: "Prensa y Comunicación, Comunicación Estratégica y Relaciones Públicas. Descubrí cómo puedo ayudarte a posicionarte en los medios." },
    ],
  },
  {
    section: "mis_valores",
    title: "Mis valores",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Mis valores — Marian Sánchez" },
      { field: "description", type: "longtext", label: "Descripción (meta description)", fallback: "Conocé la historia y los pilares que guían el trabajo de Marian Sánchez: inteligencia, integridad, libertad, compromiso y pasión por la comunicación." },
    ],
  },
  {
    section: "casos_de_exito",
    title: "Casos de éxito",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Casos de éxito — Marian Sánchez" },
      { field: "description", type: "longtext", label: "Descripción (meta description)", fallback: "56 coberturas en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para marcas reales." },
    ],
  },
  {
    section: "contacto",
    title: "Contacto",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Contacto — Marian Sánchez" },
      { field: "description", type: "longtext", label: "Descripción (meta description)", fallback: "Conversemos sobre tu estrategia de comunicación. Hablemos sobre cómo posicionar tu proyecto en los medios." },
    ],
  },
]

export function seoFallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SEO_SECTIONS, section)
}
