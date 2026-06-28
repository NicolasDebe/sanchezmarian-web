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
import type { FieldDef, SectionDef } from "@/lib/content-schema"
import { fallbacksForIn } from "@/lib/content-schema"

export const SEO_PAGE = "seo"

/** Los tres campos editables son idénticos en estructura para cada página. */
function seoFields(title: string, description: string): FieldDef[] {
  return [
    { field: "title", type: "text", label: "Título (etiqueta <title>)", fallback: title, maxChars: 70, help: "Lo que se ve en la pestaña del navegador y en Google. Idealmente menos de 60 caracteres." },
    { field: "description", type: "longtext", plain: true, label: "Descripción (meta description)", fallback: description, maxChars: 200, help: "Resumen que aparece en Google y al compartir. Ideal entre 120 y 160 caracteres." },
    { field: "og_image", type: "text", label: "Imagen al compartir (URL — vacío = imagen global)", fallback: "", maxChars: 500 },
  ]
}

export const SEO_SECTIONS: SectionDef[] = [
  {
    section: "home",
    title: "Home",
    fields: seoFields(
      "Marian Sánchez — Comunicación estratégica · Mendoza",
      "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
    ),
  },
  {
    section: "servicios",
    title: "Servicios",
    fields: seoFields(
      "Servicios — Marian Sánchez",
      "Prensa y Comunicación, Comunicación Estratégica y Relaciones Públicas. Descubrí cómo puedo ayudarte a posicionarte en los medios.",
    ),
  },
  {
    section: "mis_valores",
    title: "Mis valores",
    fields: seoFields(
      "Mis valores — Marian Sánchez",
      "Conocé la historia y los pilares que guían el trabajo de Marian Sánchez: inteligencia, integridad, libertad, compromiso y pasión por la comunicación.",
    ),
  },
  {
    section: "casos_de_exito",
    title: "Casos de éxito",
    fields: seoFields(
      "Casos de éxito — Marian Sánchez",
      "56 coberturas en medios nacionales e internacionales. La Nación, Clarín, Infobae, Vatican News, Los Andes y más. Resultados reales para marcas reales.",
    ),
  },
  {
    section: "contacto",
    title: "Contacto",
    fields: seoFields(
      "Contacto — Marian Sánchez",
      "Conversemos sobre tu estrategia de comunicación. Hablemos sobre cómo posicionar tu proyecto en los medios.",
    ),
  },
  {
    section: "campanas",
    title: "Campañas",
    fields: seoFields(
      "Campañas activas — Marian Sánchez",
      "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
    ),
  },
]

export function seoFallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SEO_SECTIONS, section)
}
