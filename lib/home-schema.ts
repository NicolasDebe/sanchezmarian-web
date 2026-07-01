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

import type { FieldType, FieldDef, SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"
import { SITE_EMAIL, WHATSAPP_HREF } from "@/lib/constants"

export type { FieldType, FieldDef, SectionDef }

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
        maxChars: 120,
        help: "Línea descriptiva sobre el título. Una sola idea.",
      },
      {
        field: "h1",
        type: "text",
        label: "Título principal (H1)",
        fallback: "Comunicar es conectar",
        maxChars: 60,
        help: "Título grande del hero. Frase corta y memorable.",
        resizable: true,
      },
      {
        field: "subtitle",
        type: "longtext",
        label: "Subtítulo / descripción",
        fallback:
          "Diseño estrategias de comunicación multiplataforma con visión de futuro que transforman tu valor diferencial en visibilidad real. Te acompaño a construir puentes honestos con los medios y la comunidad para que el mensaje de tu negocio resuene con fuerza, claridad y el impacto que realmente merece.",
        maxChars: 1500,
        help: "Texto editorial al lado de la foto. Podés escribir varios párrafos. Tu texto se ve bien hasta unas 6-8 líneas en escritorio.",
        resizable: true,
      },
      {
        field: "location_tag",
        type: "text",
        label: "Pill de ubicación (sobre el título)",
        fallback: "Mendoza, Argentina",
        maxChars: 40,
      },
      {
        field: "cta_primary_label",
        type: "text",
        label: "Botón principal — texto",
        fallback: "Conversemos",
        maxChars: 30,
      },
      {
        field: "cta_primary_link",
        type: "text",
        label: "Botón principal — destino (link)",
        fallback: "/#contacto",
        maxChars: 200,
      },
      {
        field: "cta_secondary_label",
        type: "text",
        label: "Botón secundario — texto",
        fallback: "Mis valores",
        maxChars: 30,
      },
      {
        field: "cta_secondary_link",
        type: "text",
        label: "Botón secundario — destino (link)",
        fallback: "/mis-valores",
        maxChars: 200,
      },
    ],
  },
  {
    section: "servicios",
    title: "Servicios (vidriera del home)",
    legend:
      "Cuatro servicios con jerarquía 1+3: uno destacado arriba y tres en grilla. Editá el título y la descripción corta de cada uno; el detalle completo vive en la página «Servicios». El botón del pie lleva a esa página.",
    fields: [
      {
        field: "featured_title",
        type: "text",
        label: "Servicio destacado — Título",
        fallback: "Estrategia y consultoría general de comunicación",
        maxChars: 90,
        help: "Servicio principal, card grande arriba.",
      },
      {
        field: "featured_desc",
        type: "longtext",
        plain: true,
        label: "Servicio destacado — Descripción",
        fallback:
          "Diseñado exclusivamente para empresas y marcas personales que buscan delegar su comunicación con absoluta confianza, liberando tiempo clave de su agenda para enfocarlo en el crecimiento del negocio.",
        maxChars: 400,
        help: "~3 líneas. Texto plano, sin negritas ni cursivas.",
      },
      {
        field: "s2_title",
        type: "text",
        label: "Servicio 2 — Título",
        fallback: "Prensa",
        maxChars: 60,
      },
      {
        field: "s2_desc",
        type: "longtext",
        plain: true,
        label: "Servicio 2 — Descripción",
        fallback:
          "Lograr que la empresa y su vocero aparezca en medios de comunicación relevantes para su rubro y audiencia.",
        maxChars: 320,
        help: "Texto plano, sin negritas ni cursivas.",
      },
      {
        field: "s3_title",
        type: "text",
        label: "Servicio 3 — Título",
        fallback: "Relaciones públicas y eventos",
        maxChars: 60,
      },
      {
        field: "s3_desc",
        type: "longtext",
        plain: true,
        label: "Servicio 3 — Descripción",
        fallback:
          "El vínculo estratégico entre la empresa o marca personal y sus públicos de interés: clientes, aliados, medios, comunidad y referentes del sector.",
        maxChars: 320,
        help: "Texto plano, sin negritas ni cursivas.",
      },
      {
        field: "s4_title",
        type: "text",
        label: "Servicio 4 — Título",
        fallback: "Entrenamiento en oratoria y asesoría de imagen",
        maxChars: 70,
      },
      {
        field: "s4_desc",
        type: "longtext",
        plain: true,
        label: "Servicio 4 — Descripción",
        fallback:
          "Una estrategia de comunicación es tan fuerte como la persona que la transmite. Trabajamos con el vocero o referente para que pueda comunicarse con seguridad, claridad y coherencia en cualquier plataforma o instancia pública.",
        maxChars: 320,
        help: "Texto plano, sin negritas ni cursivas.",
      },
      {
        field: "cta_label",
        type: "text",
        label: "Botón del pie — texto",
        fallback: "Ver servicios en detalle",
        maxChars: 50,
      },
    ],
  },
  {
    section: "contact",
    title: "Contacto — accesos rápidos (3 cards)",
    legend:
      "Las tres tarjetas de canales que aparecen sobre el formulario del home. Solo el canal y el identificador, sin descripciones ni tiempos de respuesta.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (sobre las cards)", fallback: "Conversemos", maxChars: 30 },
      { field: "whatsapp_label", type: "text", label: "WhatsApp — canal", fallback: "WhatsApp", maxChars: 60 },
      { field: "whatsapp_value", type: "text", label: "WhatsApp — número", fallback: "+54 261 543 3882", maxChars: 60 },
      { field: "whatsapp_link", type: "text", label: "WhatsApp — link", fallback: WHATSAPP_HREF, maxChars: 300 },
      { field: "whatsapp_cta", type: "text", label: "WhatsApp — texto del link", fallback: "Abrir conversación", maxChars: 60 },
      { field: "email_label", type: "text", label: "Email — canal", fallback: "Email", maxChars: 60 },
      { field: "email_value", type: "text", label: "Email — dirección", fallback: SITE_EMAIL, maxChars: 300 },
      { field: "email_cta", type: "text", label: "Email — texto del link", fallback: "Enviar email", maxChars: 60 },
      { field: "form_label", type: "text", label: "Formulario — canal", fallback: "Formulario", maxChars: 60 },
      { field: "form_value", type: "text", label: "Formulario — identificador", fallback: "Más abajo", maxChars: 60 },
      { field: "form_cta", type: "text", label: "Formulario — texto del link", fallback: "Ir al formulario", maxChars: 60 },
    ],
  },
  {
    section: "stats",
    title: "Stats (estadísticas)",
    fields: [
      { field: "stat_1_number", type: "number", label: "Estadística 1 — Número", fallback: "100+", maxChars: 8, help: "Ej: 100+, 10+, 3. Muy corto." },
      { field: "stat_1_label", type: "text", label: "Estadística 1 — Label", fallback: "coberturas en medios", maxChars: 36, help: "Una línea bajo el número." },
      { field: "stat_2_number", type: "number", label: "Estadística 2 — Número", fallback: "10+", maxChars: 8, help: "Ej: 100+, 10+, 3. Muy corto." },
      { field: "stat_2_label", type: "text", label: "Estadística 2 — Label", fallback: "marcas", maxChars: 36, help: "Una línea bajo el número." },
      { field: "stat_3_number", type: "number", label: "Estadística 3 — Número", fallback: "10+", maxChars: 8, help: "Ej: 100+, 10+, 3. Muy corto." },
      { field: "stat_3_label", type: "text", label: "Estadística 3 — Label", fallback: "años de experiencia", maxChars: 36, help: "Una línea bajo el número." },
      { field: "stat_4_number", type: "number", label: "Estadística 4 — Número", fallback: "3", maxChars: 8, help: "Ej: 100+, 10+, 3. Muy corto." },
      { field: "stat_4_label", type: "text", label: "Estadística 4 — Label", fallback: "servicios especializados", maxChars: 36, help: "Una línea bajo el número." },
    ],
  },
  {
    section: "metodo",
    title: "Método",
    legend:
      "Título del método — la parte destacada se muestra en cursiva bordó automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Mi método de trabajo", maxChars: 40 },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Saber qué decir,", maxChars: 60, resizable: true },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva bordó)", fallback: "a quién y cuándo.", maxChars: 60 },
      { field: "step_1_title", type: "text", label: "Paso 1 — Título", fallback: "Definición del relato", maxChars: 50 },
      { field: "step_1_desc", type: "text", label: "Paso 1 — Descripción", fallback: "Qué historia contar y a quién.", maxChars: 160 },
      { field: "step_2_title", type: "text", label: "Paso 2 — Título", fallback: "Diseño y mentoreo de la estrategia", maxChars: 50 },
      { field: "step_2_desc", type: "text", label: "Paso 2 — Descripción", fallback: "Plan de comunicación personalizado.", maxChars: 160 },
      { field: "step_3_title", type: "text", label: "Paso 3 — Título", fallback: "Gestión y relacionamiento", maxChars: 50 },
      { field: "step_3_desc", type: "text", label: "Paso 3 — Descripción", fallback: "Junto a mi equipo ejecuto el plan de comunicación que diseñamos juntos.", maxChars: 160 },
      { field: "step_4_title", type: "text", label: "Paso 4 — Título", fallback: "Monitoreo", maxChars: 50 },
      { field: "step_4_desc", type: "text", label: "Paso 4 — Descripción", fallback: "Superviso cada interacción de la campaña.", maxChars: 160 },
      { field: "step_5_title", type: "text", label: "Paso 5 — Título", fallback: "Análisis de impacto", maxChars: 50 },
      { field: "step_5_desc", type: "text", label: "Paso 5 — Descripción", fallback: "Resultados medibles y claros para avanzar al próximo nivel.", maxChars: 160 },
    ],
  },
  {
    section: "bio",
    title: "Bio",
    legend:
      "Título — la parte destacada (segunda línea) se muestra en cursiva bordó automáticamente.",
    fields: [
      { field: "badge", type: "text", label: "Badge sobre la foto", fallback: "Más de una década en comunicación", maxChars: 50 },
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Sobre Marian", maxChars: 30 },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Mariana Sánchez,", maxChars: 80, resizable: true },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva bordó)", fallback: "comunicación con propósito.", maxChars: 80 },
      {
        field: "paragraph_1",
        type: "longtext",
        label: "Párrafo 1",
        fallback:
          "Mentoreo a personas y empresas para transformar su propósito en un mensaje simple, cercano y real, conectando su propuesta de valor con los canales de comunicación adecuados. Una década de trayectoria construyendo vínculos reales con los protagonistas del ecosistema de la comunicación me respaldan.",
        maxChars: 1000,
        resizable: true,
      },
      {
        field: "paragraph_2",
        type: "longtext",
        label: "Párrafo 2",
        fallback:
          "Entiendo el ADN de cada caso y trabajo en una estrategia personalizada, aterrizada y real dentro de la comunicación del nuevo paradigma. Donde lo simple y genuino triunfa en diversas plataformas, entendiendo el público y el objetivo del mensaje.",
        maxChars: 1000,
        resizable: true,
      },
      {
        field: "paragraph_3",
        type: "longtext",
        label: "Párrafo 3",
        fallback:
          "Mi método de comunicación suma un valor diferencial a cada proyecto con contenido de calidad, chequeado y de interés genuino para los negocios del presente y del futuro.",
        maxChars: 1000,
        resizable: true,
      },
      { field: "tag_1", type: "text", label: "Tag 1", fallback: "Comunicación estratégica", maxChars: 40 },
      { field: "tag_2", type: "text", label: "Tag 2", fallback: "Prensa y medios", maxChars: 40 },
      { field: "tag_3", type: "text", label: "Tag 3", fallback: "Relaciones Públicas", maxChars: 40 },
      { field: "tag_4", type: "text", label: "Tag 4", fallback: "Mendoza, Argentina", maxChars: 40 },
      { field: "link_text", type: "text", label: "Texto del link", fallback: "Conocé mis valores", maxChars: 50 },
    ],
  },
  {
    section: "cta_final",
    title: "CTA Final",
    legend:
      "Título — la parte destacada (segunda línea) se muestra en cursiva dorada automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Hagamos que las cosas pasen.", maxChars: 80 },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Creo en el valor de las buenas historias",
        maxChars: 80,
        resizable: true,
      },
      {
        field: "title_accent",
        type: "text",
        label: "Título — texto destacado (cursiva dorada)",
        fallback: "y en el poder de las conexiones reales.",
        maxChars: 80,
      },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Si querés comunicar mejor lo que hacés, empezamos por una charla. Hablemos de la historia que tu negocio tiene para contar.",
        maxChars: 400,
        resizable: true,
      },
      { field: "email", type: "text", label: "Email de contacto", fallback: SITE_EMAIL, maxChars: 300 },
      { field: "location", type: "text", label: "Ubicación", fallback: "Mendoza, Argentina", maxChars: 60 },
      { field: "form_button", type: "text", label: "Texto del botón del formulario", fallback: "Escribime", maxChars: 30 },
    ],
  },
]

/** Devuelve el record { field: fallback } de una sección. */
export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(HOME_SECTIONS, section)
}

/** Devuelve el fallback de un campo puntual. */
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(HOME_SECTIONS, section, field)
}
