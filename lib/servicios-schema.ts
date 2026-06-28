/**
 * Esquema de contenido editable de /servicios.
 * Fuente única de verdad: sitio público (fallback), seed y editor admin.
 * Los fallbacks son EXACTAMENTE los textos que vivían hardcodeados.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const SERVICIOS_SECTIONS: SectionDef[] = [
  {
    section: "config",
    title: "Configuración",
    legend:
      "Elegí qué servicio es el PRINCIPAL: se muestra arriba, grande y con más peso visual. Los otros dos quedan como servicios secundarios, lado a lado.",
    fields: [
      {
        field: "featured",
        type: "text",
        label: "Servicio principal",
        fallback: "servicio_02",
        maxChars: 20,
        options: [
          { value: "servicio_01", label: "Prensa y Comunicación Multiplataforma" },
          { value: "servicio_02", label: "Mentoría y Asesoramiento en Comunicación Estratégica" },
          { value: "servicio_03", label: "Relaciones Públicas" },
        ],
      },
    ],
  },
  {
    section: "hero",
    title: "Hero",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Servicios", maxChars: 30 },
      {
        field: "h1",
        type: "longtext",
        // Es el H1 de la página: no puede llevar HTML adentro.
        plain: true,
        label: "Título principal (H1)",
        fallback:
          "Conexión genuina para potenciar la voz y el mensaje de tu negocio.",
        maxChars: 120,
      },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Planifico y gestiono relaciones profesionales sin intermediarios ni estructuras rígidas: vínculos fluidos y horizontales donde el diálogo y la apertura son la base de todo. Mi rol combina el asesoramiento estratégico con una gestión activa y resolutiva, creando una conexión genuina con cada persona o empresa para que se sienta verdaderamente escuchada, contenida y potenciada en cada etapa de la estrategia de comunicación de su negocio.",
        maxChars: 800,
      },
    ],
  },
  {
    section: "servicio_01",
    title: "Servicio 01",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "01", maxChars: 8 },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Prensa y Comunicación Multiplataforma", maxChars: 80 },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "Historias con impacto real.", maxChars: 100 },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "No se trata de enviar notas masivas, sino de construir puentes honestos y duraderos con los periodistas. Analizo el valor periodístico de tu negocio y lo transformo en contenido relevante para los medios tradicionales y digitales, garantizando credibilidad y autoridad.",
        maxChars: 600,
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "Gestión de Medios (Earned Media)", maxChars: 80 },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Redacción y distribución estratégica de gacetillas de prensa orientadas a objetivos, no a formatos rígidos.", maxChars: 300 },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Laboratorio de comunicación", maxChars: 80 },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Entrenamiento técnico y discursivo para voceros ante escenarios mediáticos reales.", maxChars: 300 },
      { field: "sub_3_title", type: "text", label: "Sub-servicio 3 — Título", fallback: "Monitoreo", maxChars: 80 },
      { field: "sub_3_desc", type: "longtext", label: "Sub-servicio 3 — Descripción", fallback: "Medición cualitativa del impacto de tu negocio en el ecosistema de medios de comunicación.", maxChars: 300 },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio", maxChars: 40 },
    ],
  },
  {
    section: "servicio_02",
    title: "Servicio 02",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "02", maxChars: 8 },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Mentoría y Asesoramiento en Comunicación Estratégica", maxChars: 80 },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "La arquitectura narrativa que tu negocio necesita.", maxChars: 100 },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Un espacio de asesoramiento y mentoreo fluido desde mi expertise en comunicación. Trabajo a la par de los profesionales para descubrir su brillo auténtico, estructurar sus mensajes clave y diseñar un plan de visibilidad personalizado.",
        maxChars: 600,
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "Auditoría y Planificación 360°", maxChars: 80 },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Diagnóstico profundo de la identidad del negocio y alineación de la comunicación interna con la externa.", maxChars: 300 },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Estrategia Multiplataforma", maxChars: 80 },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Co-creación de narrativas que fluyen con sinergia y coherencia en diversos canales de comunicación.", maxChars: 300 },
      { field: "sub_3_title", type: "text", label: "Sub-servicio 3 — Título", fallback: "Gestión de Alianzas Estratégicas", maxChars: 80 },
      { field: "sub_3_desc", type: "longtext", label: "Sub-servicio 3 — Descripción", fallback: "Formo equipo con profesionales especializados en marketing y redes sociales para ofrecerte soluciones integrales.", maxChars: 300 },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio", maxChars: 40 },
    ],
  },
  {
    section: "servicio_03",
    title: "Servicio 03",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente. Este servicio tiene solo 2 sub-servicios.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "03", maxChars: 8 },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Relaciones Públicas", maxChars: 80 },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "Conexión genuina para potenciar tu historia y tu red de contactos.", maxChars: 100 },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Diseño y coordino acciones presenciales donde el diálogo y la apertura son los protagonistas. Conecto a profesionales con sus públicos de interés (stakeholders), autoridades y líderes de opinión, creando entornos de confianza mutua.",
        maxChars: 600,
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "RRPP y Networking Estratégico", maxChars: 80 },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Planificación de eventos de alto impacto. Conexión directa y gestión de invitaciones para actividades relacionadas al nicho de tu negocio.", maxChars: 300 },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Lanzamientos", maxChars: 80 },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Coordinación integral de la convocatoria de prensa y cobertura mediática para eventos.", maxChars: 300 },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio", maxChars: 40 },
    ],
  },
  {
    section: "transition",
    title: "Frase de transición",
    legend:
      "Frase puente entre el servicio destacado y los servicios secundarios. Si la dejás vacía, se muestra solo un divisor decorativo (línea dorada + asterisco).",
    fields: [
      { field: "phrase", type: "text", label: "Frase de transición", fallback: "", maxChars: 160 },
    ],
  },
  {
    section: "alianzas",
    title: "Alianzas / Conexiones",
    legend:
      "Banda de palabras clave que muestra las disciplinas con las que Marian forma equipo (alianzas). Escribí UNA palabra clave por línea en el campo de abajo: cada línea se muestra como una etiqueta. Si dejás la lista vacía, la sección entera se oculta.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Conexiones", maxChars: 30 },
      { field: "title", type: "text", label: "Frase de presentación", fallback: "Formo equipo con especialistas en", maxChars: 80 },
      {
        field: "items",
        type: "longtext",
        plain: true,
        label: "Palabras clave (una por línea)",
        fallback: "Audiovisual\nMarketing\nVentas",
        maxChars: 300,
      },
    ],
  },
  {
    section: "cta",
    title: "CTA Final",
    legend:
      "Cierre de la página. La segunda parte del título se muestra en cursiva dorada automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Hagamos que las cosas pasen.", maxChars: 80 },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Creo en el valor de las buenas historias", maxChars: 80 },
      { field: "title_accent", type: "text", label: "Título — destacado (cursiva dorada)", fallback: "y en el poder de las conexiones reales.", maxChars: 80 },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Si querés comunicar mejor lo que hacés, empezamos por una charla. Hablemos de la historia que tu negocio tiene para contar.",
        maxChars: 400,
      },
      { field: "button_text", type: "text", label: "Texto del botón", fallback: "Conversemos", maxChars: 40 },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SERVICIOS_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(SERVICIOS_SECTIONS, section, field)
}
