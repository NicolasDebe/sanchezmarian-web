/**
 * Esquema de contenido editable de /servicios.
 * Fuente única de verdad: sitio público (fallback), seed y editor admin.
 * Los fallbacks son EXACTAMENTE los textos oficiales aprobados por Marian
 * ("Pilares del servicio"). Si Supabase está vacío, la página se ve idéntica.
 *
 * Estructura: hero + 4 bloques de servicio apilados + CTA final. Las listas de
 * ítems se editan como longtext multilínea (un ítem por línea), igual que el
 * patrón de `alianzas.items`.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const SERVICIOS_SECTIONS: SectionDef[] = [
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
        fallback: "Cuatro servicios, una comunicación con propósito.",
        maxChars: 120,
      },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback:
          "Diseño y coordino la comunicación de tu negocio de forma integral: estrategia, prensa, relaciones públicas y vocería bajo un mismo propósito, con la flexibilidad de adaptarse a tu estructura y a tu momento.",
        maxChars: 800,
      },
    ],
  },

  /* ───────────── BLOQUE 01 — Estrategia y Consultoría General ───────────── */
  {
    section: "servicio_01",
    title: "Servicio 01 — Estrategia y consultoría",
    legend: "Servicio principal. La descripción admite varios párrafos (separalos con una línea en blanco).",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "01 · Servicio principal", maxChars: 40 },
      { field: "title", type: "text", label: "Título", fallback: "Estrategia y consultoría general de comunicación", maxChars: 90 },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Diseñado exclusivamente para empresas y marcas personales que buscan delegar su comunicación con absoluta confianza, liberando tiempo clave de su agenda para enfocarlo en el crecimiento del negocio.\n\nEs un esquema de trabajo flexible: el servicio se adapta a la estructura del cliente. Coordinamos y potenciamos a los profesionales o proveedores que la empresa ya tenga, o buscamos al perfil experto adecuado mediante alianzas estratégicas.",
        maxChars: 800,
      },
      { field: "includes_label", type: "text", label: "Label de la lista", fallback: "Qué incluye", maxChars: 40 },
      { field: "sub_1_title", type: "text", label: "Punto 1 — Título", fallback: "Planificación y visión 360°", maxChars: 80 },
      { field: "sub_1_desc", type: "longtext", plain: true, label: "Punto 1 — Descripción", fallback: "Se diseña o adapta la estrategia macro y se coordina cada arista para que todas las acciones internas, externas y contenidos formen parte de un mismo mecanismo integrado.", maxChars: 320 },
      { field: "sub_2_title", type: "text", label: "Punto 2 — Título", fallback: "Cero micromanagement", maxChars: 80 },
      { field: "sub_2_desc", type: "longtext", plain: true, label: "Punto 2 — Descripción", fallback: "Se elimina la carga operativa del referente. El servicio asume la supervisión técnica de redacciones, piezas visuales y campañas, sin que el cliente tenga que validar cada detalle diario.", maxChars: 320 },
      { field: "sub_3_title", type: "text", label: "Punto 3 — Título", fallback: "Asistencia y consultoría continua", maxChars: 80 },
      { field: "sub_3_desc", type: "longtext", plain: true, label: "Punto 3 — Descripción", fallback: "Espacio de asesoría permanente sobre cómo trabajar estratégicamente cada plataforma. Acompañamiento técnico a profesionales de redes, marketing, diseño, programación y audiovisual bajo un mismo criterio.", maxChars: 320 },
      { field: "sub_4_title", type: "text", label: "Punto 4 — Título", fallback: "Garantía de coherencia", maxChars: 80 },
      { field: "sub_4_desc", type: "longtext", plain: true, label: "Punto 4 — Descripción", fallback: "El propósito del negocio se traduce de forma idéntica, orgánica y fluida en cada canal.", maxChars: 320 },
    ],
  },

  /* ───────────── BLOQUE 02 — Prensa ───────────── */
  {
    section: "servicio_02",
    title: "Servicio 02 — Prensa",
    legend: "Cada lista de ítems se edita escribiendo un ítem por línea.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "02 · Servicio", maxChars: 40 },
      { field: "title", type: "text", label: "Título", fallback: "Prensa", maxChars: 90 },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Lograr que la empresa y su vocero aparezcan en medios de comunicación relevantes para su rubro y audiencia. Trabajamos en dos modalidades, según objetivo y momento del negocio.",
        maxChars: 500,
      },
      { field: "organica_label", type: "text", label: "Sub-bloque A — Nombre", fallback: "Prensa orgánica", maxChars: 40 },
      { field: "organica_desc", type: "longtext", plain: true, label: "Sub-bloque A — Descripción", fallback: "Cobertura espontánea, no pautada, aprovechando la red de contactos en medios locales. La noticia se instala de forma natural por la relación con periodistas y editores, y fundamentalmente por una temática de interés genuino — muchas veces, de servicio al ciudadano.", maxChars: 500 },
      { field: "organica_items", type: "longtext", plain: true, label: "Sub-bloque A — Ítems (uno por línea)", fallback: "Mayor credibilidad percibida\nMenor costo\nRequiere propuesta de valor noticiable y timing adecuado", maxChars: 400 },
      { field: "pautada_label", type: "text", label: "Sub-bloque B — Nombre", fallback: "Prensa pautada", maxChars: 40 },
      { field: "pautada_desc", type: "longtext", plain: true, label: "Sub-bloque B — Descripción", fallback: "Publicación garantizada en medios mediante inversión publicitaria acordada. Resultados predecibles en cuanto a aparición y alcance, con mayor control sobre el mensaje, formato y medio.", maxChars: 500 },
      { field: "pautada_items", type: "longtext", plain: true, label: "Sub-bloque B — Ítems (uno por línea)", fallback: "Ideal para lanzamientos y campañas\nMás directa, alcance asegurado\nControl sobre el mensaje", maxChars: 400 },
      { field: "includes_label", type: "text", label: "Label de la lista común", fallback: "En ambos casos incluye", maxChars: 40 },
      { field: "includes_items", type: "longtext", plain: true, label: "Lista común (uno por línea)", fallback: "Redacción de la gacetilla de prensa\nDefinición del ángulo noticioso o novedad a comunicar\nSelección de medios y gestión de la publicación\nSeguimiento del impacto y reporte de apariciones (clipping)\nAgenda de vocería en medios\nInforme final y próximos pasos", maxChars: 700 },
    ],
  },

  /* ───────────── BLOQUE 03 — Relaciones Públicas y Eventos ───────────── */
  {
    section: "servicio_03",
    title: "Servicio 03 — Relaciones públicas y eventos",
    legend: "La lista se edita con un ítem por línea. El sub-servicio destacado va resaltado.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "03 · Servicio", maxChars: 40 },
      { field: "title", type: "text", label: "Título", fallback: "Relaciones públicas y eventos", maxChars: 90 },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Vínculo estratégico entre la empresa o marca personal y sus públicos de interés: clientes, aliados, medios, comunidad y referentes del sector. Incluye la diagramación y organización de eventos como herramienta de comunicación tangible y experiencial.",
        maxChars: 500,
      },
      { field: "includes_label", type: "text", label: "Label de la lista", fallback: "Qué incluye", maxChars: 40 },
      { field: "includes_items", type: "longtext", plain: true, label: "Lista (uno por línea)", fallback: "Definición del objetivo del evento en función de la estrategia comercial (lanzamiento, networking, fidelización, posicionamiento)\nArmado de lista de invitados según público objetivo y propósito\nDiseño del concepto del evento y la experiencia a generar\nCoordinación logística y comunicacional antes, durante y después del evento\nGeneración de contenido y cobertura del evento para amplificar su impacto", maxChars: 800 },
      { field: "sub_label", type: "text", label: "Sub-servicio — Label", fallback: "Sub-servicio", maxChars: 40 },
      { field: "sub_title", type: "text", label: "Sub-servicio — Título", fallback: "Monitoreo de agenda y gestión de oportunidades", maxChars: 90 },
      { field: "sub_desc", type: "longtext", plain: true, label: "Sub-servicio — Descripción", fallback: "Seguimiento constante y estratégico de las principales actividades, foros y eventos clave de la región vinculados al nicho del negocio. Identificación de dónde tiene que estar la marca, sugerencia de conexiones de valor y gestión de invitaciones o accesos preferenciales para consolidar el posicionamiento institucional.", maxChars: 500 },
    ],
  },

  /* ───────────── BLOQUE 04 — Oratoria y Asesoría de Imagen ───────────── */
  {
    section: "servicio_04",
    title: "Servicio 04 — Oratoria y asesoría de imagen",
    legend: "Dos listas (oratoria e imagen). Cada una con un ítem por línea.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "04 · Servicio", maxChars: 40 },
      { field: "title", type: "text", label: "Título", fallback: "Entrenamiento en oratoria y asesoría de imagen", maxChars: 90 },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Una estrategia de comunicación es tan fuerte como la persona que la transmite. Trabajamos con el vocero o referente de la empresa para que pueda comunicarse con seguridad, claridad y coherencia en cualquier plataforma o instancia pública.",
        maxChars: 500,
      },
      { field: "oratoria_label", type: "text", label: "Lista A — Label", fallback: "Entrenamiento en oratoria", maxChars: 50 },
      { field: "oratoria_items", type: "longtext", plain: true, label: "Lista A — Ítems (uno por línea)", fallback: "Técnicas de oratoria y manejo del lenguaje verbal y no verbal\nPreparación específica para entrevistas en medios (radio, TV, prensa escrita, podcast)\nComunicación efectiva en redes sociales, videos institucionales y presentaciones en vivo\nGestión de situaciones de crisis comunicacional y Q&A de crisis para preguntas incómodas", maxChars: 700 },
      { field: "imagen_label", type: "text", label: "Lista B — Label", fallback: "Asesoría de imagen", maxChars: 50 },
      { field: "imagen_items", type: "longtext", plain: true, label: "Lista B — Ítems (uno por línea)", fallback: "Presentación personal del vocero acorde al mensaje, la audiencia y la plataforma\nCoherencia entre la imagen de la persona y la identidad de la empresa\nRecomendaciones de indumentaria, estética y comunicación visual para cada contexto", maxChars: 500 },
    ],
  },

  /* ───────────── CTA FINAL ───────────── */
  {
    section: "cta",
    title: "CTA Final",
    legend: "Cierre de la página, centrado. El botón lleva a /contacto.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Conversemos", maxChars: 40 },
      { field: "title", type: "text", label: "Título", fallback: "Diseñemos juntos tu estrategia.", maxChars: 90 },
      {
        field: "description",
        type: "longtext",
        label: "Descripción",
        fallback: "Cada empresa requiere su propio mix. Hablemos para entender el tuyo.",
        maxChars: 300,
      },
      { field: "button_text", type: "text", label: "Texto del botón", fallback: "Agendá una conversación", maxChars: 40 },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SERVICIOS_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(SERVICIOS_SECTIONS, section, field)
}
