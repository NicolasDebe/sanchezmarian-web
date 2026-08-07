/**
 * Esquema de contenido editable de /contacto (página oculta pero migrable).
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"
import { SITE_EMAIL, SOCIAL_LINKS } from "@/lib/constants"

export const CONTACTO_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    legend:
      "La segunda línea del título (destacada) se muestra grande y en cursiva bordó automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Contacto", maxChars: 30, resizable: true },
      {
        field: "h1_pre",
        type: "text",
        label: "Título — primera línea",
        fallback: "Hagamos que las cosas pasen.",
        maxChars: 80,
        help: "El tamaño y la fuente que elijas acá se aplican a las dos líneas del título.",
        resizable: true,
      },
      { field: "h1_accent", type: "text", label: "Título — segunda línea (destacada, cursiva)", fallback: "Conversemos.", maxChars: 60 },
    ],
  },
  {
    section: "info",
    title: "Datos de contacto",
    legend:
      "En el título, la parte destacada se muestra en cursiva terracota automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Datos de contacto", maxChars: 30, resizable: true },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Estoy disponible para",
        maxChars: 60,
        help: "El tamaño y la fuente que elijas acá se aplican al título completo.",
        resizable: true,
      },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva terracota)", fallback: "nuevos proyectos.", maxChars: 60 },
      { field: "email", type: "text", label: "Email", fallback: SITE_EMAIL, maxChars: 300, resizable: true },
      { field: "location", type: "text", label: "Ubicación", fallback: "Mendoza, Argentina", maxChars: 60, resizable: true },
      { field: "availability", type: "text", label: "Disponibilidad", fallback: "Agendar sesión", maxChars: 60, resizable: true },
      { field: "instagram_url", type: "text", label: "URL de Instagram", fallback: SOCIAL_LINKS.instagram, maxChars: 300 },
      { field: "linkedin_url", type: "text", label: "URL de LinkedIn", fallback: SOCIAL_LINKS.linkedin, maxChars: 300 },
      { field: "form_eyebrow", type: "text", label: "Formulario — eyebrow", fallback: "Formulario de contacto", maxChars: 60, resizable: true },
      { field: "form_title", type: "text", label: "Formulario — título", fallback: "Contame en qué puedo ayudarte.", maxChars: 80, resizable: true },
    ],
  },
  {
    section: "faq",
    title: "Preguntas frecuentes",
    legend:
      "En el título, la parte destacada se muestra en cursiva terracota automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Preguntas frecuentes", maxChars: 30, resizable: true },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Antes de escribirme,",
        maxChars: 60,
        help: "El tamaño y la fuente que elijas acá se aplican al título completo.",
        resizable: true,
      },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva terracota)", fallback: "quizás acá está la respuesta.", maxChars: 80 },
      { field: "q1", type: "text", label: "Pregunta 1", fallback: "¿Cómo empezamos a trabajar juntos?", maxChars: 160, resizable: true },
      { field: "a1", type: "longtext", label: "Respuesta 1", fallback: "Agendamos una charla para conocernos, entender tu proyecto y ver cómo puedo ayudarte a comunicarlo.", maxChars: 400, resizable: true },
      { field: "q2", type: "text", label: "Pregunta 2", fallback: "¿Con qué tipo de clientes trabajás?", maxChars: 160, resizable: true },
      { field: "a2", type: "longtext", label: "Respuesta 2", fallback: "Trabajo con marcas, empresas, profesionales independientes y emprendedores de todo tamaño. Lo que importa es tener una historia para contar.", maxChars: 400, resizable: true },
      { field: "q3", type: "text", label: "Pregunta 3", fallback: "¿En cuánto tiempo ven resultados?", maxChars: 160, resizable: true },
      { field: "a3", type: "longtext", label: "Respuesta 3", fallback: "Depende del servicio. En prensa, las primeras apariciones pueden darse en semanas. Construir presencia a largo plazo lleva más tiempo, pero se nota.", maxChars: 400, resizable: true },
      { field: "q4", type: "text", label: "Pregunta 4", fallback: "¿Trabajás solo con clientes de Mendoza?", maxChars: 160, resizable: true },
      { field: "a4", type: "longtext", label: "Respuesta 4", fallback: "No. Tengo clientes en Buenos Aires, Córdoba y otras provincias. Mi trabajo no tiene fronteras geográficas.", maxChars: 400, resizable: true },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(CONTACTO_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(CONTACTO_SECTIONS, section, field)
}
