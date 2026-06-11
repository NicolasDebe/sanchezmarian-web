/**
 * Esquema de contenido editable de /servicios.
 * Fuente única de verdad: sitio público (fallback), seed y editor admin.
 * Los fallbacks son EXACTAMENTE los textos que vivían hardcodeados.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const SERVICIOS_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Servicios" },
      {
        field: "h1",
        type: "longtext",
        // Es el H1 de la página: no puede llevar HTML adentro.
        plain: true,
        label: "Título principal (H1)",
        fallback:
          "Conexión genuina para potenciar la voz y el mensaje de tu negocio.",
      },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Planifico y gestiono relaciones profesionales sin intermediarios ni estructuras rígidas: vínculos fluidos y horizontales donde el diálogo y la apertura son la base de todo. Mi rol combina el asesoramiento estratégico con una gestión activa y resolutiva, creando una conexión genuina con cada persona o empresa para que se sienta verdaderamente escuchada, contenida y potenciada en cada etapa de la estrategia de comunicación de su negocio.",
      },
    ],
  },
  {
    section: "servicio_01",
    title: "Servicio 01",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "01" },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Prensa y Comunicación Multiplataforma" },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "Historias con impacto real." },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "No se trata de enviar notas masivas, sino de construir puentes honestos y duraderos con los periodistas. Analizo el valor periodístico de tu negocio y lo transformo en contenido relevante para los medios tradicionales y digitales, garantizando credibilidad y autoridad.",
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "Gestión de Medios (Earned Media)" },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Redacción y distribución estratégica de gacetillas de prensa orientadas a objetivos, no a formatos rígidos." },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Laboratorio de comunicación" },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Entrenamiento técnico y discursivo para voceros ante escenarios mediáticos reales." },
      { field: "sub_3_title", type: "text", label: "Sub-servicio 3 — Título", fallback: "Monitoreo" },
      { field: "sub_3_desc", type: "longtext", label: "Sub-servicio 3 — Descripción", fallback: "Medición cualitativa del impacto de tu negocio en el ecosistema de medios de comunicación." },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio" },
    ],
  },
  {
    section: "servicio_02",
    title: "Servicio 02",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "02" },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Mentoría y Asesoramiento en Comunicación Estratégica" },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "La arquitectura narrativa que tu negocio necesita." },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Un espacio de asesoramiento y mentoreo fluido desde mi expertise en comunicación. Trabajo a la par de los profesionales para descubrir su brillo auténtico, estructurar sus mensajes clave y diseñar un plan de visibilidad personalizado.",
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "Auditoría y Planificación 360°" },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Diagnóstico profundo de la identidad del negocio y alineación de la comunicación interna con la externa." },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Estrategia Multiplataforma" },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Co-creación de narrativas que fluyen con sinergia y coherencia en diversos canales de comunicación." },
      { field: "sub_3_title", type: "text", label: "Sub-servicio 3 — Título", fallback: "Gestión de Alianzas Estratégicas" },
      { field: "sub_3_desc", type: "longtext", label: "Sub-servicio 3 — Descripción", fallback: "Formo equipo con profesionales especializados en marketing y redes sociales para ofrecerte soluciones integrales." },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio" },
    ],
  },
  {
    section: "servicio_03",
    title: "Servicio 03",
    legend:
      "La frase destacada (tagline) se muestra en cursiva automáticamente. Este servicio tiene solo 2 sub-servicios.",
    fields: [
      { field: "number", type: "text", label: "Número", fallback: "03" },
      { field: "name", type: "text", label: "Nombre del servicio", fallback: "Relaciones Públicas" },
      { field: "tagline", type: "text", label: "Frase destacada (cursiva)", fallback: "Conexión genuina para potenciar tu historia y tu red de contactos." },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Diseño y coordino acciones presenciales donde el diálogo y la apertura son los protagonistas. Conecto a profesionales con sus públicos de interés (stakeholders), autoridades y líderes de opinión, creando entornos de confianza mutua.",
      },
      { field: "sub_1_title", type: "text", label: "Sub-servicio 1 — Título", fallback: "RRPP y Networking Estratégico" },
      { field: "sub_1_desc", type: "longtext", label: "Sub-servicio 1 — Descripción", fallback: "Planificación de eventos de alto impacto. Conexión directa y gestión de invitaciones para actividades relacionadas al nicho de tu negocio." },
      { field: "sub_2_title", type: "text", label: "Sub-servicio 2 — Título", fallback: "Lanzamientos" },
      { field: "sub_2_desc", type: "longtext", label: "Sub-servicio 2 — Descripción", fallback: "Coordinación integral de la convocatoria de prensa y cobertura mediática para eventos." },
      { field: "cta_text", type: "text", label: "Texto del botón", fallback: "Quiero este servicio" },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SERVICIOS_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(SERVICIOS_SECTIONS, section, field)
}
