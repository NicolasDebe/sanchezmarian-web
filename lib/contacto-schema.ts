/**
 * Esquema de contenido editable de /contacto (página oculta pero migrable).
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const CONTACTO_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    legend:
      "La segunda línea del título (destacada) se muestra grande y en cursiva bordó automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Contacto" },
      { field: "h1_pre", type: "text", label: "Título — primera línea", fallback: "Hagamos que las cosas pasen." },
      { field: "h1_accent", type: "text", label: "Título — segunda línea (destacada, cursiva)", fallback: "Conversemos." },
    ],
  },
  {
    section: "info",
    title: "Datos de contacto",
    legend:
      "En el título, la parte destacada se muestra en cursiva terracota automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Datos de contacto" },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Estoy disponible para" },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva terracota)", fallback: "nuevos proyectos." },
      { field: "email", type: "text", label: "Email", fallback: "contacto@sanchezmarian.com" },
      { field: "location", type: "text", label: "Ubicación", fallback: "Mendoza, Argentina" },
      { field: "availability", type: "text", label: "Disponibilidad", fallback: "Agendar sesión" },
      { field: "instagram_url", type: "text", label: "URL de Instagram", fallback: "https://www.instagram.com/marian15s/" },
      { field: "linkedin_url", type: "text", label: "URL de LinkedIn", fallback: "https://www.linkedin.com/in/marians%C3%A1nchez/" },
      { field: "form_eyebrow", type: "text", label: "Formulario — eyebrow", fallback: "Formulario de contacto" },
      { field: "form_title", type: "text", label: "Formulario — título", fallback: "Contame en qué puedo ayudarte." },
    ],
  },
  {
    section: "faq",
    title: "Preguntas frecuentes",
    legend:
      "En el título, la parte destacada se muestra en cursiva terracota automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Preguntas frecuentes" },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Antes de escribirme," },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva terracota)", fallback: "quizás acá está la respuesta." },
      { field: "q1", type: "text", label: "Pregunta 1", fallback: "¿Cómo empezamos a trabajar juntos?" },
      { field: "a1", type: "longtext", label: "Respuesta 1", fallback: "Agendamos una charla para conocernos, entender tu proyecto y ver cómo puedo ayudarte a comunicarlo." },
      { field: "q2", type: "text", label: "Pregunta 2", fallback: "¿Con qué tipo de clientes trabajás?" },
      { field: "a2", type: "longtext", label: "Respuesta 2", fallback: "Trabajo con marcas, empresas, profesionales independientes y emprendedores de todo tamaño. Lo que importa es tener una historia para contar." },
      { field: "q3", type: "text", label: "Pregunta 3", fallback: "¿En cuánto tiempo ven resultados?" },
      { field: "a3", type: "longtext", label: "Respuesta 3", fallback: "Depende del servicio. En prensa, las primeras apariciones pueden darse en semanas. Construir presencia a largo plazo lleva más tiempo, pero se nota." },
      { field: "q4", type: "text", label: "Pregunta 4", fallback: "¿Trabajás solo con clientes de Mendoza?" },
      { field: "a4", type: "longtext", label: "Respuesta 4", fallback: "No. Tengo clientes en Buenos Aires, Córdoba y otras provincias. Mi trabajo no tiene fronteras geográficas." },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(CONTACTO_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(CONTACTO_SECTIONS, section, field)
}
