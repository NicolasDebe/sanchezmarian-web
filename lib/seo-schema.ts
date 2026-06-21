/**
 * Esquema de metadata SEO editable.
 *
 * Todo el SEO vive bajo page="seo" en content_blocks, con una SECCIÓN por cada
 * página del sitio (home, servicios, …). Cada sección tiene `title`,
 * `description` y un `og_image` opcional (imagen al compartir). Así un único
 * editor (page="seo") cubre todas las páginas y `generateMetadata` de cada
 * página lee su sección. Si `og_image` está vacío, usa la imagen global por
 * defecto (global/metadata/og_default_image).
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
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
  {
    section: "servicios",
    title: "Servicios",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Servicios — Marian Sánchez" },
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "Prensa y Comunicación, Comunicación Estratégica y Relaciones Públicas. Descubrí cómo puedo ayudarte a posicionarte en los medios." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
  {
    section: "mis_valores",
    title: "Mis valores",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Mis valores — Marian Sánchez" },
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "Conocé la historia y los pilares que guían el trabajo de Marian Sánchez: inteligencia, integridad, libertad, compromiso y pasión por la comunicación." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
  {
    section: "casos_de_exito",
    title: "Casos de éxito",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Casos de éxito — Marian Sánchez" },
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "56 coberturas en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para marcas reales." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
  {
    section: "contacto",
    title: "Contacto",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Contacto — Marian Sánchez" },
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "Conversemos sobre tu estrategia de comunicación. Hablemos sobre cómo posicionar tu proyecto en los medios." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
  {
    section: "campanas",
    title: "Campañas",
    fields: [
      { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: "Campañas activas — Marian Sánchez" },
      { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza." },
      { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "" },
    ],
  },
]

export function seoFallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SEO_SECTIONS, section)
}
