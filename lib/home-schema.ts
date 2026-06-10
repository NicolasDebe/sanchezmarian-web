/**
 * Esquema de contenido editable del HOME.
 *
 * Fuente ÚNICA de verdad para:
 *  - los fallbacks que usa el sitio público (app/page.tsx + getContentBatch)
 *  - el seed inicial a Supabase (scripts/seed-content.ts)
 *  - el editor del admin (app/admin/edit/home)
 *
 * Los fallbacks son EXACTAMENTE los textos que vivían hardcodeados en los
 * componentes. No inventar: si Supabase no responde, el sitio se ve idéntico.
 *
 * Este módulo es data pura (sin imports de servidor) para poder usarse tanto
 * en Server Components como en Client Components.
 */

export type FieldType = "text" | "longtext" | "number"

export interface FieldDef {
  field: string
  type: FieldType
  label: string
  fallback: string
}

export interface SectionDef {
  /** slug usado en content_blocks.section */
  section: string
  /** título legible para el acordeón del admin */
  title: string
  fields: FieldDef[]
}

export const HOME_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    fields: [
      {
        field: "eyebrow",
        type: "text",
        label: "Eyebrow (línea superior)",
        fallback:
          "Comunicación estratégica y narrativas multiplataforma para negocios",
      },
      {
        field: "h1",
        type: "text",
        label: "Título principal (H1)",
        fallback: "Comunicar es conectar",
      },
      {
        field: "subtitle",
        type: "longtext",
        label: "Subtítulo / descripción",
        fallback:
          "Diseño estrategias de comunicación multiplataforma con visión de futuro que transforman tu valor diferencial en visibilidad real. Te acompaño a construir puentes honestos con los medios y la comunidad para que el mensaje de tu negocio resuene con fuerza, claridad y el impacto que realmente merece.",
      },
      {
        field: "cta_primary",
        type: "text",
        label: "Botón principal",
        fallback: "Tengo un negocio con una historia para contar",
      },
      {
        field: "cta_secondary",
        type: "text",
        label: "Botón secundario",
        fallback: "Mis valores",
      },
    ],
  },
  {
    section: "stats",
    title: "Stats (estadísticas)",
    fields: [
      { field: "stat_1_number", type: "number", label: "Estadística 1 — Número", fallback: "100+" },
      { field: "stat_1_label", type: "text", label: "Estadística 1 — Label", fallback: "coberturas en medios" },
      { field: "stat_2_number", type: "number", label: "Estadística 2 — Número", fallback: "10+" },
      { field: "stat_2_label", type: "text", label: "Estadística 2 — Label", fallback: "marcas" },
      { field: "stat_3_number", type: "number", label: "Estadística 3 — Número", fallback: "10+" },
      { field: "stat_3_label", type: "text", label: "Estadística 3 — Label", fallback: "años de experiencia" },
      { field: "stat_4_number", type: "number", label: "Estadística 4 — Número", fallback: "3" },
      { field: "stat_4_label", type: "text", label: "Estadística 4 — Label", fallback: "servicios especializados" },
    ],
  },
  {
    section: "metodo",
    title: "Método",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Mi método de trabajo" },
      { field: "title", type: "text", label: "Título", fallback: "Saber qué decir, a quién y cuándo." },
      { field: "step_1_title", type: "text", label: "Paso 1 — Título", fallback: "Definición del relato" },
      { field: "step_1_desc", type: "text", label: "Paso 1 — Descripción", fallback: "Qué historia contar y a quién." },
      { field: "step_2_title", type: "text", label: "Paso 2 — Título", fallback: "Diseño y mentoreo de la estrategia" },
      { field: "step_2_desc", type: "text", label: "Paso 2 — Descripción", fallback: "Plan de comunicación personalizado." },
      { field: "step_3_title", type: "text", label: "Paso 3 — Título", fallback: "Gestión y relacionamiento" },
      { field: "step_3_desc", type: "text", label: "Paso 3 — Descripción", fallback: "Junto a mi equipo ejecuto el plan de comunicación que diseñamos juntos." },
      { field: "step_4_title", type: "text", label: "Paso 4 — Título", fallback: "Monitoreo" },
      { field: "step_4_desc", type: "text", label: "Paso 4 — Descripción", fallback: "Superviso cada interacción de la campaña." },
      { field: "step_5_title", type: "text", label: "Paso 5 — Título", fallback: "Análisis de impacto" },
      { field: "step_5_desc", type: "text", label: "Paso 5 — Descripción", fallback: "Resultados medibles y claros para avanzar al próximo nivel." },
    ],
  },
  {
    section: "bio",
    title: "Bio",
    fields: [
      { field: "badge", type: "text", label: "Badge sobre la foto", fallback: "Más de una década en comunicación" },
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Sobre Marian" },
      { field: "title", type: "text", label: "Título", fallback: "Mariana Sánchez, comunicación con propósito." },
      {
        field: "paragraph_1",
        type: "longtext",
        label: "Párrafo 1",
        fallback:
          "Mentoreo a personas y empresas para transformar su propósito en un mensaje simple, cercano y real, conectando su propuesta de valor con los canales de comunicación adecuados. Una década de trayectoria construyendo vínculos reales con los protagonistas del ecosistema de la comunicación me respaldan.",
      },
      {
        field: "paragraph_2",
        type: "longtext",
        label: "Párrafo 2",
        fallback:
          "Entiendo el ADN de cada caso y trabajo en una estrategia personalizada, aterrizada y real dentro de la comunicación del nuevo paradigma. Donde lo simple y genuino triunfa en diversas plataformas, entendiendo el público y el objetivo del mensaje.",
      },
      {
        field: "paragraph_3",
        type: "longtext",
        label: "Párrafo 3",
        fallback:
          "Mi método de comunicación suma un valor diferencial a cada proyecto con contenido de calidad, chequeado y de interés genuino para los negocios del presente y del futuro.",
      },
      { field: "tag_1", type: "text", label: "Tag 1", fallback: "Comunicación estratégica" },
      { field: "tag_2", type: "text", label: "Tag 2", fallback: "Prensa y medios" },
      { field: "tag_3", type: "text", label: "Tag 3", fallback: "Relaciones Públicas" },
      { field: "tag_4", type: "text", label: "Tag 4", fallback: "Mendoza, Argentina" },
      { field: "link_text", type: "text", label: "Texto del link", fallback: "Conocé mis valores" },
    ],
  },
  {
    section: "cta_final",
    title: "CTA Final",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Hagamos que las cosas pasen." },
      {
        field: "title",
        type: "longtext",
        label: "Título",
        fallback:
          "Creo en el valor de las buenas historias y en el poder de las conexiones reales.",
      },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Si querés comunicar mejor lo que hacés, empezamos por una charla. Hablemos de la historia que tu negocio tiene para contar.",
      },
      { field: "email", type: "text", label: "Email de contacto", fallback: "contacto@sanchezmarian.com" },
      { field: "location", type: "text", label: "Ubicación", fallback: "Mendoza, Argentina" },
      { field: "form_button", type: "text", label: "Texto del botón del formulario", fallback: "Escribime" },
      { field: "whatsapp_text", type: "text", label: "Texto del link de WhatsApp", fallback: "Escribime por acá" },
    ],
  },
]

/** Devuelve el record { field: fallback } de una sección. */
export function fallbacksFor(section: string): Record<string, string> {
  const def = HOME_SECTIONS.find((s) => s.section === section)
  if (!def) return {}
  return Object.fromEntries(def.fields.map((f) => [f.field, f.fallback]))
}

/** Devuelve el fallback de un campo puntual. */
export function fallbackOf(section: string, field: string): string {
  return HOME_SECTIONS.find((s) => s.section === section)?.fields.find((f) => f.field === field)?.fallback ?? ""
}
